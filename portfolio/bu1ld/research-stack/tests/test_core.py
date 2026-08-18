import unittest
from lego_ml.cli import build
from lego_ml.core import TensorSpec

class TestLegoML(unittest.TestCase):
    def test_wildcard_compatibility(self):
        a = TensorSpec(('batch','token','embedding'), (None,64,128), 'latent_sequence')
        b = TensorSpec(('batch','token','embedding'), (32,None,128), 'latent_sequence')
        self.assertTrue(a.compatible_with(b))

    def test_three_stacks_validate(self):
        for path in ('examples/vision_jepa.json','examples/time_series_memory.json','examples/scientific_field.json'):
            self.assertEqual(build(path)['status'], 'VALID')

if __name__ == '__main__':
    unittest.main()
