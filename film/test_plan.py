#!/usr/bin/env python3
import unittest
from plan_scenes import plan

class TestPlanScenes(unittest.TestCase):
    def test_locations_detection(self):
        cases = [
            ("The athlete played soccer in the stadium.", "sports"),
            ("The teacher taught students in the classroom school.", "school"),
            ("The chef cooked dinner in the kitchen.", "kitchen"),
            ("The farmer drove the tractor across the farm.", "farm"),
            ("The doctor examined patients in the hospital.", "hospital"),
            ("The pilot flew the jet from the airport runway.", "airport"),
        ]
        for text, expected_loc in cases:
            scenes = plan(text)
            self.assertTrue(len(scenes) > 0)
            self.assertEqual(scenes[0]["location"], expected_loc, f"Failed for text: '{text}'")

    def test_output_fields(self):
        text = "The doctor performed surgery in the hospital. \"He will recover,\" said the nurse."
        scenes = plan(text)
        self.assertTrue(len(scenes) > 0)
        expected_fields = {
            "text", "quote", "location", "tod", "weather", "era",
            "speaker", "role", "role2", "characters", "nouns", "mood", "shots"
        }
        for scene in scenes:
            for field in expected_fields:
                self.assertIn(field, scene, f"Missing field {field} in scene")

if __name__ == "__main__":
    unittest.main()
