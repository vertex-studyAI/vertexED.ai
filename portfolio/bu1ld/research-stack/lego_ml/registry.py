from .core import TensorSpec, ComponentSpec

B = None
REGISTRY = {
    'cnn_encoder': ComponentSpec('cnn_encoder', TensorSpec(('batch','channel','height','width'), (B,3,32,32), 'image'), TensorSpec(('batch','token','embedding'), (B,64,128), 'latent_sequence')),
    'transformer_encoder': ComponentSpec('transformer_encoder', TensorSpec(('batch','token','feature'), (B,96,16), 'sequence'), TensorSpec(('batch','token','embedding'), (B,96,128), 'latent_sequence')),
    'spatial_encoder': ComponentSpec('spatial_encoder', TensorSpec(('batch','channel','height','width'), (B,4,32,32), 'field'), TensorSpec(('batch','token','embedding'), (B,64,128), 'latent_sequence')),
    'jepa_predictor': ComponentSpec('jepa_predictor', TensorSpec(('batch','token','embedding'), (B,None,128), 'latent_sequence'), TensorSpec(('batch','token','embedding'), (B,None,128), 'latent_sequence')),
    'engram_memory': ComponentSpec('engram_memory', TensorSpec(('batch','token','embedding'), (B,None,128), 'latent_sequence'), TensorSpec(('batch','token','embedding'), (B,None,128), 'latent_sequence')),
    'predictive_loss': ComponentSpec('predictive_loss', TensorSpec(('batch','token','embedding'), (B,None,128), 'latent_sequence'), TensorSpec(('batch',), (B,), 'loss')),
    'forecast_head': ComponentSpec('forecast_head', TensorSpec(('batch','token','embedding'), (B,None,128), 'latent_sequence'), TensorSpec(('batch','horizon'), (B,24), 'forecast')),
    'field_decoder': ComponentSpec('field_decoder', TensorSpec(('batch','token','embedding'), (B,None,128), 'latent_sequence'), TensorSpec(('batch','channel','height','width'), (B,4,32,32), 'field')),
}
