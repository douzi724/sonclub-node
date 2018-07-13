#!/bin/bash

function runmaster() {
  master=$(hostname -i)
  sed -i "s/%slave-ip%/${master}/" /redis-master/redis.conf
  sed -i "s/%slave-port%/6379/" /redis-master/redis.conf

  if [[ ! -e /data/redis ]]; then
    echo "Redis master data doesn't exist, data won't be persistent!"
    mkdir /data/redis
  fi
  echo "Redis master start!"
  redis-server /redis-master/redis.conf --protected-mode no
}

function runserver() {
  while true; do
    master=$(redis-cli -h ${REDIS_SENTINEL_SERVICE_HOST} -p ${REDIS_SENTINEL_SERVICE_PORT} --csv SENTINEL get-master-addr-by-name mymaster | tr ',' ' ' | cut -d' ' -f1)
    if [[ -n ${master} ]]; then
      master="${master//\"}"
    else
      runmaster
      exit 0
    fi
    redis-cli -h ${master} INFO
    if [[ "$?" == "0" ]]; then
      break
    fi
    echo "Connecting to master failed.  Waiting..."
    sleep 10
  done
  selfIp=$(hostname -i)
  sed -i "s/%slave-ip%/${selfIp}/" /redis-slave/redis.conf
  sed -i "s/%slave-port%/6379/" /redis-slave/redis.conf

  sed -i "s/%master-ip%/${master}/" /redis-slave/redis.conf
  sed -i "s/%master-port%/6379/" /redis-slave/redis.conf

  if [[ ! -e /data/redis ]]; then
    echo "Redis data doesn't exist, data won't be persistent!"
    mkdir /data/redis
  fi
  echo "Redis slave start! master=${master}"
  redis-server /redis-slave/redis.conf --protected-mode no
}

function runsentinel() {
  while true; do
    master=$(redis-cli -h ${REDIS_SENTINEL_SERVICE_HOST} -p ${REDIS_SENTINEL_SERVICE_PORT} --csv SENTINEL get-master-addr-by-name mymaster | tr ',' ' ' | cut -d' ' -f1)
    if [[ -n ${master} ]]; then
      echo "Find master from sentinel!!!"
    elif  [[ -n ${REDIS_SERVER_SERVICE_HOST} ]]; then
      echo "Find master from deployment!!!"
      master=$(redis-cli -h ${REDIS_SERVER_SERVICE_HOST} -p 6379 --csv CONFIG get slave-announce-ip | tr ',' ' ' | cut -d' ' -f2)
    else
      echo "Find master from statefulset!!!"
      master=$(redis-cli -h redis-server-0.redis-server -p 6379 --csv CONFIG get slave-announce-ip | tr ',' ' ' | cut -d' ' -f2)
    fi
    master="${master//\"}"

    redis-cli -h ${master} INFO
    if [[ "$?" == "0" ]]; then
      break
    fi
    echo "Connecting to master failed.  Waiting..."
    sleep 10
  done

  sentinel_conf=sentinel.conf

  echo "sentinel monitor mymaster ${master} 6379 2" > ${sentinel_conf}
  echo "sentinel down-after-milliseconds mymaster 60000" >> ${sentinel_conf}
  echo "sentinel failover-timeout mymaster 180000" >> ${sentinel_conf}
  echo "sentinel parallel-syncs mymaster 1" >> ${sentinel_conf}
  echo "bind 0.0.0.0" >> ${sentinel_conf}
  
  echo "Redis sentinel start! master=${master}"
  redis-sentinel ${sentinel_conf} --protected-mode no
}


if [[ "${SENTINEL}" == "true" ]]; then
  runsentinel
  exit 0
fi

runserver
