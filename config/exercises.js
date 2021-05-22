const ExerciseNames = {
  exercises: {
    squats: 'Squats',
    rope: 'Jumping Rope',
  },
  measurement: {
    pants: 'Pants',
    hand: 'Hand',
  },
};

const Exercises = [
  {
    name: ExerciseNames.exercises.squats,
    key: ExerciseNames.exercises.squats,
    video: true,
    measurement: [
      ExerciseNames.measurement.pants,
      ExerciseNames.measurement.hand,
    ],
  },
  {
    name: ExerciseNames.exercises.rope,
    key: ExerciseNames.exercises.rope,
    video: true,
    measurement: [ExerciseNames.measurement.pants],
  },
];

export default Exercises;
