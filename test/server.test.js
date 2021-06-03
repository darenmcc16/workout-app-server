const knex = require('knex')
const app = require('../src/app');
const { makeUsersArray, makeMaliciousUser } = require('./users.fixtures')




/////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////// workouts ///////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////



describe('Workout API:', function () {
    let db;
    let workouts = [{
            "user_id": 1,
            "video_id": "ljijojo",
            "title": "40 min hiit",
            "thumbnail": "thumbnail 3",
            "description": "40 min workout"
        },
        {
            "user_id": 1,
            "video_id": "iojjon",
            "title": "100 run",
            "thumbnail": "thumbnail 4",
            "description": "a lot of running"
        },
        {
            "user_id": 1,
            "video_id": "hhhggdg",
            "title": "ab workout",
            "thumbnail": "thumbnail 5",
            "description": "an ab workout"
        },
        {
            "user_id": 1,
            "video_id": "ooooe",
            "title": "jumping jacks",
            "thumbnail": "thumbnail 6",
            "description": "a lot of jumping"
        },
        {
            "user_id": 1,
            "video_id": "ddddgugu",
            "title": "up downs",
            "thumbnail": "thumbnail 7",
            "description": "going up and down"
        }
    ]


    before('make knex instance', () => {
        db = knex({
            client: 'pg',
            connection: process.env.TEST_DATABASE_URL,
        })
        app.set('db', db)
    });

    before('cleanup', () => db.raw('TRUNCATE TABLE workout RESTART IDENTITY;'));

    afterEach('cleanup', () => db.raw('TRUNCATE TABLE workout RESTART IDENTITY;'));

    after('disconnect from the database', () => db.destroy());

    describe('GET all workouts', () => {

        beforeEach('insert some workouts', () => {
            return db('workout').insert(workouts);
        })

        //relevant
        it('should respond to GET `/api/workout-plan` with an array of workouts and status 200', function () {
            return supertest(app)
                .get('/api/workout-plan')
                .expect(200)
                .expect(res => {
                    expect(res.body).to.be.a('array');
                    expect(res.body).to.have.length(workouts.length);
                    res.body.forEach((item) => {
                        expect(item).to.be.a('object');
                        expect(item).to.include.keys('id', 'user_id','video_id','title','thumbnail','description');
                    });
                });
        });

    });


    describe('GET workouts by id', () => {

        beforeEach('insert some workouts', () => {
            return db('workout').insert(workouts);
        })

        it('should return correct workout when given an id', () => {
            let doc;
            return db('workout')
                .first()
                .then(_doc => {
                    doc = _doc
                    return supertest(app)
                        .get(`/api/workout-plan/${doc.id}`)
                        .expect(200);
                })
                .then(res => {
                    expect(res.body).to.be.an('object');
                    expect(res.body).to.include.keys('id', 'user_id','video_id','title','thumbnail','description');
                    expect(res.body.id).to.equal(doc.id);
                    expect(res.body.title).to.equal(doc.title);
                });
        });

        it('should respond with a 404 when given an invalid id', () => {
            return supertest(app)
                .get('/api/workout-plan/aaaaaaaaaaaa')
                .expect(404);
        });

    });


    describe('POST (create) new workout', function () {

        //relevant
        it('should create and return a new workout when provided valid data', function () {
            const newItem =   {
                "user_id": 1,
                "video_id": "iojjon",
                "title": "100 run",
                "thumbnail": "thumbnail 4",
                "description": "a lot of running"
            };

            return supertest(app)
                .post('/api/workout-plan')
                .send(newItem)
                .expect(201)
                .expect(res => {
                    expect(res.body).to.be.a('object');
                    expect(res.body).to.include.keys('id', 'user_id','video_id','title','thumbnail','description');
                    expect(res.body.title).to.equal(newItem.title);
                    expect(res.headers.location).to.equal(`/api/workout-plan/${res.body.id}`)
                });
        });

        it('should respond with 400 status when given bad data', function () {
            const badItem = {
                foobar: 'broken item'
            };
            return supertest(app)
                .post('/api/workout-plan')
                .send(badItem)
                .expect(400);
        });

    });


    describe('PATCH (update) workout by id', () => {

        beforeEach('insert some workouts', () => {
            return db('workout').insert(workouts);
        })

        //relevant
        it('should update item when given valid data and an id', function () {
            const item =   {
                "user_id": 1,
                "video_id": "iojjon",
                "title": "100 run",
                "thumbnail": "thumbnail 4",
                "description": "a lot of running"
            };

            let doc;
            return db('workout')
                .first()
                .then(_doc => {
                    doc = _doc
                    return supertest(app)
                        .patch(`/api/workout-plan/${doc.id}`)
                        .send(item)
                        .expect(200);
                })
                .then(res => {
                    expect(res.body).to.be.a('object');
                    expect(res.body).to.include.keys('id', 'user_id','video_id','title','thumbnail','description');
                    expect(res.body.title).to.equal(item.title);
                });
        });

        it('should respond with 400 status when given bad data', function () {
            const badItem = {
                foobar: 'broken item'
            };

            return db('workout')
                .first()
                .then(doc => {
                    return supertest(app)
                        .patch(`/api/workout-plan/${doc.id}`)
                        .send(badItem)
                        .expect(400);
                })
        });

        it('should respond with a 404 for an invalid id', () => {
            const item =   {
                "user_id": 1,
                "video_id": "iojjon",
                "title": "100 run",
                "thumbnail": "thumbnail 4",
                "description": "a lot of running"
            };
            return supertest(app)
                .patch('/api/workout-plan/aaaaaaaaaaaaaaaaaaaaaaaa')
                .send(item)
                .expect(404);
        });

    });


    describe('DELETE a workouts by id', () => {

        beforeEach('insert some workouts', () => {
            return db('workout').insert(workouts);
        })

        //relevant
        it('should delete an item by id', () => {
            return db('workout')
                .first()
                .then(doc => {
                    return supertest(app)
                        .delete(`/api/workout-plan/${doc.id}`)
                        .expect(204);
                })
        });

        it('should respond with a 404 for an invalid id', function () {
            return supertest(app)
                .delete('/api/workout-plan/aaaaaaaaaaaaaaaaaaaaaaaa')
                .expect(404);
        });
    });
});





/////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////// users /////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////


describe(`Users API Endpoints`, () => {
    let db;

    before('make knex instance', () => {
        db = knex({
            client: 'pg',
            connection: process.env.TEST_DATABASE_URL,
        })
        app.set('db', db)
    });
    before('cleanup', () => db.raw('TRUNCATE TABLE users RESTART IDENTITY;'));

    afterEach('cleanup', () => db.raw('TRUNCATE TABLE users RESTART IDENTITY;'));

    after('disconnect from the database', () => db.destroy());

    describe('GET /api/users', () => {

        context(`Given there are users in the db`, () => {
        
            const testUsers = makeUsersArray();
            
            beforeEach('insert users into db', () => {
                return db
                .into('users')
                .insert(testUsers)
            })
            
            it('responds with 200 and all of the users', function () {
                return supertest(app)
                .get('/api/users')
                .set('Authorization', `Bearer ${process.env.API_TOKEN}`) 
                .expect(200)
                .expect(res => {
                    expect(res.body.id).to.eql(testUsers.id)
                    expect(res.body.username).to.eql(testUsers.username)
                })
            });
            
        });

        context('Given an XSS attack user', () => {
            const testUsers = makeUsersArray();
            const { maliciousUser, expectedUser} = makeMaliciousUser();

            beforeEach('insert malicious user into db', () => {
                return db  
                    .into('users')
                    .insert(maliciousUser)
            });
                
            it(`removes XSS attack content`, () => {
                return supertest(app)
                    .get(`/api/users/${maliciousUser.id}`)
                    .set('Authorization', `Bearer ${process.env.API_TOKEN}`)
                    .expect(200)
                    .expect(res => {
                        expect(res.body.username).to.eql(expectedUser.username)
                        expect(res.body.password).to.eql(expectedUser.password)
                        expect(res.body.email).to.eql(expectedUser.email)
                    })
            });
        
        });
   
    });

    describe(`POST /api/users`, () => {

        it(`creates a user, responding with 204`, function () {
            const newUser = {
                username: 'Test new user', 
                password: 'aaAA11!!',

            };
            return supertest(app)
                .post(`/api/users/`)
                .set('Authorization', `Bearer ${process.env.API_TOKEN}`)
                .send(newUser)
                .expect(204)
        });
    
    });

});