import unittest
import warnings
from app import db, create_app, Workouts, Exercise

class WorkoutTestCase(unittest.TestCase):

    @classmethod
    def setUpClass(cls):
        # Set up the Flask test client and app context
        cls.flask_app = create_app()
        cls.flask_app.config['TESTING'] = True
        cls.flask_app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///:memory:'
        cls.flask_app.config['WTF_CSRF_ENABLED'] = False

        cls.test_client = cls.flask_app.test_client()

        with cls.flask_app.app_context():
            db.create_all()

    @classmethod
    def tearDownClass(cls):
        # Tear down the database
        with cls.flask_app.app_context():
            db.session.remove()
            db.drop_all()

    def setUp(self):
        # Start a new test transaction
        self.app_context = self.flask_app.app_context()
        self.app_context.push()

    def tearDown(self):
        # Rollback the transaction and pop the context
        db.session.rollback()
        self.app_context.pop()

    def test_update_workouts(self):
        # Set up the initial workout entry
        with self.flask_app.app_context():
            workout = Workouts(title='Test Workout')
            db.session.add(workout)
            db.session.commit()
            workout_id = workout.id

        # Send a PUT request to update the workout
        response = self.test_client.put(f'/api/workouts/{workout_id}', json={'title': 'Updated Workout'})

        # Verify the response status code and updated data
        self.assertEqual(response.status_code, 200)
        json_data = response.get_json()
        self.assertEqual(json_data['title'], 'Updated Workout')

        # Verify the database has the updated workout title
        with self.flask_app.app_context():
            updated_workout = db.session.get(Workouts, workout_id)
            self.assertEqual(updated_workout.title, 'Updated Workout')

if __name__ == '__main__':
    unittest.main()