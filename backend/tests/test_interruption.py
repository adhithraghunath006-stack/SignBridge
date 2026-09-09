import unittest
from services.conversation_engine import ConversationEngine, ConversationState

class InterruptionFencingTestCase(unittest.TestCase):
    def setUp(self):
        self.engine = ConversationEngine()

    def test_interruption_invalidates_active_response(self):
        """
        Critical Test:
        IF response A is speaking
        AND user interrupts
        THEN response A MUST NOT continue
        AND response B becomes the active response.
        """
        # Step 1: Signer produces HELLO
        result_a = self.engine.process_sign_input("HELLO", confidence=0.98)
        self.assertTrue(result_a["success"])
        response_a_id = result_a["response_id"]
        self.assertEqual(self.engine.state, ConversationState.SPEAKING)
        self.assertEqual(self.engine.active_response_id, response_a_id)

        # Step 2: Hearing user interrupts mid-speech
        interrupt_res = self.engine.interrupt(reason="speech_overlap")
        self.assertTrue(interrupt_res["success"])
        self.assertEqual(interrupt_res["invalidated_response_id"], response_a_id)
        self.assertEqual(self.engine.state, ConversationState.INTERRUPTED)
        self.assertIsNone(self.engine.active_response_id)

        # Step 3: Verify stale audio completion is rejected
        stale_complete = self.engine.complete_speaking(response_a_id)
        self.assertFalse(stale_complete["success"])
        self.assertIn("superseded or cancelled", stale_complete["reason"])

        # Step 4: Hearing user turn arrives
        turn_b = self.engine.process_speech_input("Wait, where are you going?")
        self.assertTrue(turn_b["success"])
        self.assertTrue(turn_b["interrupted_prior"])
        self.assertEqual(self.engine.state, ConversationState.LISTENING)

    def test_interruption_stop_latency_is_under_threshold(self):
        """Verify interruption stop execution happens in < 50ms."""
        self.engine.process_sign_input("HELP", confidence=0.92)
        int_res = self.engine.interrupt()
        self.assertLess(int_res["stop_latency_ms"], 50.0)

if __name__ == "__main__":
    unittest.main()
