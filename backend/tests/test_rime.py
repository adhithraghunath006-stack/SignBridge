import unittest
from services.rime_service import RimeService

class RimeServiceTestCase(unittest.TestCase):
    def setUp(self):
        self.service = RimeService()

    def test_synthesize_valid_text(self):
        """Test Rime synthesis returns audio payload and low latency."""
        res = self.service.synthesize("Testing SignBridge audio.")
        self.assertTrue(res["success"], msg=f"Rime API call failed: {res.get('error')}")
        self.assertIsNotNone(res["audio_base64"])
        self.assertEqual(res["model"], "coda")
        self.assertLess(res["latency_ms"], 5000.0)

    def test_synthesize_empty_text_handled_gracefully(self):
        """Empty text should not cause crashes."""
        res = self.service.synthesize("")
        self.assertFalse(res["success"])
        self.assertEqual(res["error"], "Empty text provided")

if __name__ == "__main__":
    unittest.main()
