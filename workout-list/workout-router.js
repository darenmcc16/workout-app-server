const path = require('path')
const express = require('express')
const xss = require('xss')
const workoutService = require('./workout-service')

const workoutRouter = express.Router()
const jsonParser = express.json()

//filter out the response to avoid showing broken data
const serializeWorkout = workout => ({
    id: workout.id,
     user_id:workout.user_id,
    videoid:workout.videoid,
    title: xss(workout.title),
    thumbnail: xss(workout.thumbnail),
    description: xss(workout.description)
})

workoutRouter
    .route('/')
    //relevant
    .get((req, res, next) => {

        //connect to the service to get the data
        workoutService.getWorkouts(req.app.get('db'))
            .then(workouts => {
                //map the results to get each one of the objects and serialize them
                res.json(workouts.map(serializeWorkout))
            })
            .catch(next)
    })
    //relevant
    .post(jsonParser, (req, res, next) => {

        //take the input from the user
        const {
            user_id,
            videoid,
            title,
            thumbnail,
            description
        } = req.body
        const newWorkout = {
            user_id,
            videoid,
            title,
            thumbnail,
            description
        }
console.log(newWorkout)
        //validate the input
        for (const [key, value] of Object.entries(newWorkout)) {
            if (value == null) {
                //if there is an error show it
                return res.status(400).json({
                    error: {
                        message: `Missing '${key}' in request body`
                    }
                })
            }
        }

        //save the input in the db
        workoutService.insertWorkout(
                req.app.get('db'),
                newWorkout
            )
            .then(workout => {
                res
                //display the 201 status code
                    .status(201)
                    //redirect the request to the original url adding the workout id for editing
                    .location(path.posix.join(req.originalUrl, `/${workout.id}`))
                    //return the serialized results
                    .json(serializeWorkout(workout))
            })
            .catch(next)
    })


workoutRouter
    .route('/:workout_id')
    .all((req, res, next) => {
        if (isNaN(parseInt(req.params.workout_id))) {
            //if there is an error show it
            return res.status(404).json({
                error: {
                    message: `Invalid id`
                }
            })
        }

        //connect to the service to get the data
        workoutService.getWorkoutById(
                req.app.get('db'),
                req.params.workout_id
            )
            .then(workout => {
                if (!workout) {
                    //if there is an error show it
                    return res.status(404).json({
                        error: {
                            message: `workout doesn't exist`
                        }
                    })
                }
                res.workout = workout
                next()
            })
            .catch(next)
    })
    .get((req, res, next) => {

        //get each one of the objects from the results and serialize them
        res.json(serializeWorkout(res.workout))
    })
    //relevant
    .patch(jsonParser, (req, res, next) => {

        //take the input from the user
        const {
            title,
            completed
        } = req.body
        const workoutToUpdate = {
            title,
            completed
        }

        //validate the input by checking the length of the workoutToUpdate object to make sure that we have all the values
        const numberOfValues = Object.values(workoutToUpdate).filter(Boolean).length
        if (numberOfValues === 0) {
            //if there is an error show it
            return res.status(400).json({
                error: {
                    message: `Request body must content either 'title' or 'completed'`
                }
            })
        }

        //save the input in the db
        workoutService.updateWorkout(
                req.app.get('db'),
                req.params.workout_id,
                workoutToUpdate
            )
            .then(updatedWorkout => {

                //get each one of the objects from the results and serialize them
                res.status(200).json(serializeWorkout(updatedWorkout))
            })
            .catch(next)
    })
    //relevant
    .delete((req, res, next) => {
        workoutService.deleteWorkout(
                req.app.get('db'),
                req.params.workout_id
            )
            .then(numRowsAffected => {

                //check how many rows are effected to figure out if the delete was successful
                res.status(204).json(numRowsAffected).end()
            })
            .catch(next)
    })


module.exports = workoutRouter