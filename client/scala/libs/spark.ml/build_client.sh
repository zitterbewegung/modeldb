../../../../scripts/gen_thrift_file.py scala '../../../../thrift/ModelDB.thrift' './src/main/thrift/ModelDB.thrift'
../../../../scripts/gen_thrift_file.py scala '../../../../thrift/ModelDB_API.thrift' './src/main/thrift/ModelDB_API.thrift'
sbt clean && sbt assembly