package tracing

import (
	"context"
	"net/http"

	"github.com/opentracing/opentracing-go"
	"github.com/opentracing/opentracing-go/ext"
)

// SpanStart 开始一个http请求span
func SpanStart(r *http.Request, tags map[string]string) opentracing.Span {
	ctx, _ := Tracer.Extract(opentracing.HTTPHeaders, opentracing.HTTPHeadersCarrier(r.Header))
	sp := Tracer.StartSpan("HTTP "+r.Method+" "+r.URL.Path, ext.RPCServerOption(ctx))
	if sp != nil {
		for k, v := range tags {
			sp.SetTag(k, v)
		}
		*r = *r.WithContext(opentracing.ContextWithSpan(r.Context(), sp))
	}

	return sp
}

// SpanStart 结束一个http请求span
func SpanFinish(sp opentracing.Span, statusCode uint16) {
	if sp != nil {
		ext.HTTPStatusCode.Set(sp, statusCode)
		sp.Finish()
	}
}

// ReqWithTracing 将请求加入当前追踪链中
func ReqWithTracing(ctx *context.Context, r *http.Request) {
	sp := opentracing.SpanFromContext(*ctx)
	if sp != nil {
		carrier := opentracing.HTTPHeadersCarrier(r.Header)
		sp.Tracer().Inject(sp.Context(), opentracing.HTTPHeaders, carrier)
	}
}

// GetCurrentSpan 获取当前上下文中span
func GetCurrentSpan(ctx *context.Context) opentracing.Span {
	return opentracing.SpanFromContext(*ctx)
}

// CreateChildSpan 在当前上下文中创建一个子span
func CreateChildSpan(ctx *context.Context, operationName string, tags map[string]string) (*context.Context, opentracing.Span) {
	sp := GetCurrentSpan(ctx)
	if sp != nil {
		sp = sp.Tracer().StartSpan(operationName, opentracing.ChildOf(sp.Context()))
		ext.SpanKindRPCClient.Set(sp)
		ext.Component.Set(sp, "inner")
		for k, v := range tags {
			sp.SetTag(k, v)
		}
		ctxC := opentracing.ContextWithSpan(*ctx, sp)
		return &ctxC, sp
	}

	return ctx, sp
}

package tracing

import (
	"ESM-Monitor-Proxy/pkg/log"
	"fmt"
	"io"
	"time"

	"github.com/opentracing/opentracing-go"
	"github.com/uber/jaeger-client-go/config"
	"github.com/uber/jaeger-client-go/rpcmetrics"
	"github.com/uber/jaeger-lib/metrics"
	"github.com/uber/jaeger-lib/metrics/prometheus"
	"go.uber.org/zap"
)

var (
	logger         *zap.Logger
	metricsFactory metrics.Factory
	Tracer         *TracerLog
)

type TracerLog struct {
	opentracing.Tracer
	Log    tlog.Factory
	Closer io.Closer
}

type TracerCfg struct {
	ServiceName   string
	AgentHostPort string
	LogFile       string
	LogDebug      bool
	LogJson       bool
}

// InitTracer 初始化创建一个 Jaeger tracer 实例
func InitTracer(c TracerCfg) *TracerLog {
	initLogger(c)
	f := tlog.NewFactory(logger.With(zap.String("service", c.ServiceName)))
	cfg := config.Configuration{
		ServiceName: c.ServiceName,
		Sampler: &config.SamplerConfig{
			Type:  "const",
			Param: 1,
		},
		Reporter: &config.ReporterConfig{
			LogSpans:            false,
			BufferFlushInterval: 1 * time.Second,
			LocalAgentHostPort:  c.AgentHostPort,
		},
	}

	tracer, closer, err := cfg.NewTracer(
		config.Logger(jaegerLoggerAdapter{f.Bg()}),
		config.Observer(rpcmetrics.NewObserver(metricsFactory, rpcmetrics.DefaultNameNormalizer)),
	)
	if err != nil {
		f.Bg().Fatal("初始化 Jaeger Tracer 实例出错", zap.Error(err))
	}
	Tracer = &TracerLog{Tracer: tracer, Log: f, Closer: closer}
	return Tracer
}

func initLogger(c TracerCfg) {
	if c.LogDebug {
		logger, _ = zap.NewDevelopment()
	} else {
		cfg := zap.NewProductionConfig()
		cfg.OutputPaths = []string{c.LogFile, "stderr"}
		if !c.LogJson {
			cfg.Encoding = "console"
		}
		logger, _ = cfg.Build()
	}
	metricsFactory = prometheus.New()
	logger.Info("Using Prometheus as metrics backend")
}

type jaegerLoggerAdapter struct {
	logger tlog.Logger
}

func (l jaegerLoggerAdapter) Error(msg string) {
	l.logger.Error(msg)
}

func (l jaegerLoggerAdapter) Infof(msg string, args ...interface{}) {
	l.logger.Info(fmt.Sprintf(msg, args...))
}

package tlog

import (
	"context"

	"github.com/opentracing/opentracing-go"
	"go.uber.org/zap"
	"go.uber.org/zap/zapcore"
)

// Factory 日志封装
type Factory struct {
	logger *zap.Logger
}

// NewFactory 创建日志Factory
func NewFactory(logger *zap.Logger) Factory {
	return Factory{logger: logger}
}

// Bg 记录和上下文中span无关的日志
func (b Factory) Bg() Logger {
	return logger{logger: b.logger}
}

// For 记录和上下文中span有关的日志
func (b Factory) For(ctx *context.Context) Logger {
	if span := opentracing.SpanFromContext(*ctx); span != nil {
		return spanLogger{span: span, logger: b.logger}
	}
	return b.Bg()
}

// With clone子日志记录，使其不影响父日志
func (b Factory) With(fields ...zapcore.Field) Factory {
	return Factory{logger: b.logger.With(fields...)}
}

package tlog

import (
	"go.uber.org/zap"
	"go.uber.org/zap/zapcore"
)

// Logger 各级别日志接口
type Logger interface {
	Info(msg string, fields ...zapcore.Field)
	Error(msg string, fields ...zapcore.Field)
	Debug(msg string, fields ...zapcore.Field)
	Fatal(msg string, fields ...zapcore.Field)
	With(fields ...zapcore.Field) Logger
}

type logger struct {
	logger *zap.Logger
}

func (l logger) Info(msg string, fields ...zapcore.Field) {
	l.logger.Info(msg, fields...)
}

func (l logger) Error(msg string, fields ...zapcore.Field) {
	l.logger.Error(msg, fields...)
}

func (l logger) Debug(msg string, fields ...zapcore.Field) {
	l.logger.Debug(msg, fields...)
}

func (l logger) Fatal(msg string, fields ...zapcore.Field) {
	l.logger.Fatal(msg, fields...)
}

// With clone子日志记录，使其不影响父日志
func (l logger) With(fields ...zapcore.Field) Logger {
	return logger{logger: l.logger.With(fields...)}
}

package tlog

import (
	"time"

	"github.com/opentracing/opentracing-go"
	"github.com/opentracing/opentracing-go/ext"
	"github.com/opentracing/opentracing-go/log"
	"go.uber.org/zap"
	"go.uber.org/zap/zapcore"
)

type spanLogger struct {
	logger *zap.Logger
	span   opentracing.Span
}

func (sl spanLogger) Info(msg string, fields ...zapcore.Field) {
	sl.logToSpan("info", msg, fields...)
	sl.logger.Info(msg, fields...)
}

func (sl spanLogger) Error(msg string, fields ...zapcore.Field) {
	ext.Error.Set(sl.span, true)
	sl.logToSpan("error", msg, fields...)
	sl.logger.Error(msg, fields...)
}

func (sl spanLogger) Debug(msg string, fields ...zapcore.Field) {
	sl.logToSpan("debug", msg, fields...)
	sl.logger.Debug(msg, fields...)
}

func (sl spanLogger) Fatal(msg string, fields ...zapcore.Field) {
	sl.logToSpan("fatal", msg, fields...)
	ext.Error.Set(sl.span, true)
	sl.logger.Fatal(msg, fields...)
}

// With clone子日志记录，使其不影响父日志
func (sl spanLogger) With(fields ...zapcore.Field) Logger {
	return spanLogger{logger: sl.logger.With(fields...), span: sl.span}
}

func (sl spanLogger) logToSpan(level string, msg string, fields ...zapcore.Field) {
	fa := fieldAdapter(make([]log.Field, 0, 2+len(fields)))
	fa = append(fa, log.String("event", msg))
	fa = append(fa, log.String("level", level))
	for _, field := range fields {
		field.AddTo(&fa)
	}
	sl.span.LogFields(fa...)
}

type fieldAdapter []log.Field

func (fa *fieldAdapter) AddBool(key string, value bool) {
	*fa = append(*fa, log.Bool(key, value))
}

func (fa *fieldAdapter) AddFloat64(key string, value float64) {
	*fa = append(*fa, log.Float64(key, value))
}

func (fa *fieldAdapter) AddFloat32(key string, value float32) {
	*fa = append(*fa, log.Float64(key, float64(value)))
}

func (fa *fieldAdapter) AddInt(key string, value int) {
	*fa = append(*fa, log.Int(key, value))
}

func (fa *fieldAdapter) AddInt64(key string, value int64) {
	*fa = append(*fa, log.Int64(key, value))
}

func (fa *fieldAdapter) AddInt32(key string, value int32) {
	*fa = append(*fa, log.Int64(key, int64(value)))
}

func (fa *fieldAdapter) AddInt16(key string, value int16) {
	*fa = append(*fa, log.Int64(key, int64(value)))
}

func (fa *fieldAdapter) AddInt8(key string, value int8) {
	*fa = append(*fa, log.Int64(key, int64(value)))
}

func (fa *fieldAdapter) AddUint(key string, value uint) {
	*fa = append(*fa, log.Uint64(key, uint64(value)))
}

func (fa *fieldAdapter) AddUint64(key string, value uint64) {
	*fa = append(*fa, log.Uint64(key, value))
}

func (fa *fieldAdapter) AddUint32(key string, value uint32) {
	*fa = append(*fa, log.Uint64(key, uint64(value)))
}

func (fa *fieldAdapter) AddUint16(key string, value uint16) {
	*fa = append(*fa, log.Uint64(key, uint64(value)))
}

func (fa *fieldAdapter) AddUint8(key string, value uint8) {
	*fa = append(*fa, log.Uint64(key, uint64(value)))
}

func (fa *fieldAdapter) AddUintptr(key string, value uintptr)                        {}
func (fa *fieldAdapter) AddArray(key string, marshaler zapcore.ArrayMarshaler) error { return nil }
func (fa *fieldAdapter) AddComplex128(key string, value complex128)                  {}
func (fa *fieldAdapter) AddComplex64(key string, value complex64)                    {}
func (fa *fieldAdapter) AddObject(key string, value zapcore.ObjectMarshaler) error   { return nil }
func (fa *fieldAdapter) AddReflected(key string, value interface{}) error            { return nil }
func (fa *fieldAdapter) OpenNamespace(key string)                                    {}

func (fa *fieldAdapter) AddDuration(key string, value time.Duration) {
	*fa = append(*fa, log.String(key, value.String()))
}

func (fa *fieldAdapter) AddTime(key string, value time.Time) {
	*fa = append(*fa, log.String(key, value.String()))
}

func (fa *fieldAdapter) AddBinary(key string, value []byte) {
	*fa = append(*fa, log.Object(key, value))
}

func (fa *fieldAdapter) AddByteString(key string, value []byte) {
	*fa = append(*fa, log.Object(key, value))
}

func (fa *fieldAdapter) AddString(key, value string) {
	if key != "" && value != "" {
		*fa = append(*fa, log.String(key, value))
	}
}
