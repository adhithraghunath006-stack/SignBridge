import unittest
from services.conversation_engine import ConversationEngine, ConversationState

class ConversationStateTestCase(unittest.TestCase):
    def setUp(self):
        self.engine = ConversationEngine()

    def test_initial_state_is_idle(self):
        self.assertEqual(self.engine.state, ConversationState.IDLE)
        self.assertIsNone(self.engine.active_response_id)

    def test_sign_to_speaking_transition(self):
        res = self.engine.process_sign_input("THANK YOU", confidence=0.96)
        self.assertTrue(res["success"])
        self.assertEqual(self.engine.state, ConversationState.SPEAKING)

    def test_clean_completion_returns_to_listening(self):
        res = self.engine.process_sign_input("YES", confidence=0.95)
        response_id = res["response_id"]
        comp = self.engine.complete_speaking(response_id)
        self.assertTrue(comp["success"])
        self.assertEqual(self.engine.state, ConversationState.LISTENING)

if __name__ == "__main__":
    unittest.main()
