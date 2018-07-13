# 端口查看
- netstat -an | grep 8080
- netstat -apn | grep 8080  +  ps -ef | grep pid
- lsof -i:8080

# 存储大小
- df -lh
- du -hcs ./data/

# 时间
- date -R
- date -s 14:36:00
- date -s 20171128
- date -s "2008-08-08 12:00:00"

# 网络和网卡
- brctl show 查看bridge网络
- ip a 查看网卡
- ip r 查看路由表
- sysctl net.ipv4.ip_forward 查看IP路由转发状态（net.ipv4.ip_forward = 1 开启）
- iptables-save 查看iptables配置
- iptables -t nat -S 查看NAT转换规则
- tcpdump -i 网卡 -n icmp 监控网卡ping

# golang 远程调试
- dlv debug [package] --headless --listen=:8181 --api-version=2 --log 
- dlv attach [pid] --headless --listen=:8181 --api-version=2 --log
- dlv exec <path/to/binary> --headless --listen=:8181 --api-version=2 --log

# 环境变量
- /etc/profile  && source /etc/profile  对所有用户生效(永久的)
- ~/.bash_profile ~./.bashrc 对单一用户生效(永久的)
- 直接 export 定义变量  只对当前shell(BASH)有效(临时的) 

# kubectl 命令补全
- source /usr/share/bash-completion/bash_completion
- source <(kubectl completion bash)
