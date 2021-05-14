const workoutService = {
    //relevant
    getWorkouts(db) {
        return db
            .select('*')
            .from('workouts')
    },
    getWorkoutById(db, workout_id) {
        return db
            .select('*')
            .from('workouts')
            .where('workout.id', workout_id)
            .first()
    },
    //relevant
    insertWorkout(db, newWorkout) {
        return db
            .insert(newWorkout)
            .into('workouts')
            .returning('*')
            .then(rows => {
                return rows[0]
            })
    },
    //relevant
    updateWorkout(db, workout_id, newWorkout) {
        return db('workouts')
            .update(newWorkout, returning = true)
            .where({
                id: workout_id
            })
            .returning('*')
            .then(rows => {
                return rows[0]
            })
    },
    //relevant
    deleteWorkout(db, workout_id) {
        return db('workouts')
            .delete()
            .where({
                'id': workout_id
            })
    }
}

module.exports = workoutService