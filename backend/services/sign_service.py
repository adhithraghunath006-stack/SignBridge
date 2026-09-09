"""
Sign Language vocabulary catalog and geometric gesture verification service.
"""
from typing import Dict, Any, List

class SignService:
    VOCABULARY = {
        "HELLO": {
            "token": "HELLO",
            "description": "Open flat hand waving smoothly near temple or chest",
            "category": "greeting",
            "natural_phrase": "Hello, it is great to see you.",
            "animation_steps": ["open_palm_temple", "wave_outward"]
        },
        "THANK YOU": {
            "token": "THANK YOU",
            "description": "Fingers touch chin/lips and move outward toward partner",
            "category": "courtesy",
            "natural_phrase": "Thank you very much.",
            "animation_steps": ["fingers_chin", "extend_forward"]
        },
        "YES": {
            "token": "YES",
            "description": "Fist nodding up and down like a nodding head",
            "category": "affirmation",
            "natural_phrase": "Yes, absolutely.",
            "animation_steps": ["fist_tilt_down", "fist_tilt_up"]
        },
        "NO": {
            "token": "NO",
            "description": "Index and middle fingers snap down onto the thumb",
            "category": "negation",
            "natural_phrase": "No, that is not correct.",
            "animation_steps": ["two_fingers_open", "snap_to_thumb"]
        },
        "HELP": {
            "token": "HELP",
            "description": "Thumbs-up fist placed on open flat palm and lifted together",
            "category": "request",
            "natural_phrase": "Could you please help me with something?",
            "animation_steps": ["palm_flat_base", "fist_lift"]
        },
        "STOP": {
            "token": "STOP",
            "description": "One flat hand chops down onto the open palm of the other",
            "category": "command",
            "natural_phrase": "Please stop for a moment.",
            "animation_steps": ["chop_downward"]
        },
        "WHERE": {
            "token": "WHERE",
            "description": "Index finger held vertical and gently shaken side to side",
            "category": "question",
            "natural_phrase": "Where is that located?",
            "animation_steps": ["index_point_up", "wiggle_lateral"]
        },
        "YOU": {
            "token": "YOU",
            "description": "Index finger pointing directly at the conversation partner",
            "category": "pronoun",
            "natural_phrase": "You are right.",
            "animation_steps": ["point_forward"]
        },
        "ME": {
            "token": "ME",
            "description": "Index finger pointing gently toward one's own chest",
            "category": "pronoun",
            "natural_phrase": "I am here.",
            "animation_steps": ["point_chest"]
        },
        "GOOD": {
            "token": "GOOD",
            "description": "Fingers touch chin and move down onto open flat palm",
            "category": "descriptor",
            "natural_phrase": "That sounds very good.",
            "animation_steps": ["touch_chin", "drop_to_palm"]
        },
        "BAD": {
            "token": "BAD",
            "description": "Fingers touch chin then flip downward and away",
            "category": "descriptor",
            "natural_phrase": "That is unfortunate.",
            "animation_steps": ["touch_chin", "flip_down"]
        },
        "NAME": {
            "token": "NAME",
            "description": "H-hands with index and middle fingers tapping together crosswise",
            "category": "identity",
            "natural_phrase": "What is your name?",
            "animation_steps": ["tap_fingers_cross"]
        },
        "GO": {
            "token": "GO",
            "description": "Both index fingers roll forward pointing in the direction of movement",
            "category": "action",
            "natural_phrase": "Let us go ahead.",
            "animation_steps": ["roll_forward"]
        },
        "COME": {
            "token": "COME",
            "description": "Both index fingers beckon inward toward the signer",
            "category": "action",
            "natural_phrase": "Please come over here.",
            "animation_steps": ["beckon_inward"]
        },
        "WATER": {
            "token": "WATER",
            "description": "W-handshape (three middle fingers upright) tapping index against chin",
            "category": "need",
            "natural_phrase": "Could I please get some water?",
            "animation_steps": ["w_shape_chin_tap"]
        },
        "FOOD": {
            "token": "FOOD",
            "description": "Flattened O-hand tips touching lips repeatedly",
            "category": "need",
            "natural_phrase": "I would like some food, please.",
            "animation_steps": ["touch_lips_repeat"]
        },
        "PLEASE": {
            "token": "PLEASE",
            "description": "Flat open palm rubbing in a circular motion on the chest",
            "category": "courtesy",
            "natural_phrase": "Please and thank you.",
            "animation_steps": ["circle_chest"]
        },
        "SORRY": {
            "token": "SORRY",
            "description": "A-hand fist rubbing in a circular motion over the heart",
            "category": "courtesy",
            "natural_phrase": "I am really sorry about that.",
            "animation_steps": ["rub_chest_fist"]
        },
        "HOW ARE YOU": {
            "token": "HOW ARE YOU",
            "description": "Curved hands roll upward opening outwards toward the partner",
            "category": "greeting",
            "natural_phrase": "How are you doing today?",
            "animation_steps": ["curved_hands_roll", "open_to_partner"]
        },
    }

    CONFIDENCE_THRESHOLD = 0.70

    def get_vocabulary(self) -> List[Dict[str, Any]]:
        return list(self.VOCABULARY.values())

    def evaluate_sign(self, token: str, raw_confidence: float) -> Dict[str, Any]:
        token_upper = token.upper().strip()
        is_known = token_upper in self.VOCABULARY
        is_confident = raw_confidence >= self.CONFIDENCE_THRESHOLD

        if not is_known:
            return {
                "valid": False,
                "token": token_upper,
                "confidence": raw_confidence,
                "error": f"Unknown sign: {token_upper}. Check supported vocabulary.",
            }

        vocab_info = self.VOCABULARY[token_upper]
        return {
            "valid": True,
            "token": token_upper,
            "confidence": raw_confidence,
            "is_confident": is_confident,
            "warning": None if is_confident else "Not confident — please repeat the sign.",
            "natural_phrase": vocab_info["natural_phrase"],
            "animation_steps": vocab_info["animation_steps"],
            "category": vocab_info["category"],
        }

sign_service = SignService()
