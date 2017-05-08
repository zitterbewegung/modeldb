from modeldb.basic.Structs import (
    Model, ModelConfig, ModelMetrics, Dataset)
from modeldb.basic.ModelDbSyncerBase import Syncer

syncer_obj = Syncer.create_syncer_from_config(
    "/Users/arcarter/code/modeldb/client/syncer.json")

filename = "YamlSample.yaml"

syncer_obj.sync_test(filename)
