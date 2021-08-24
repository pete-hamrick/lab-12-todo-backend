require('dotenv').config();

const { execSync } = require('child_process');

const fakeRequest = require('supertest');
const app = require('../lib/app');
const client = require('../lib/client');

describe('app routes', () => {
  describe('routes', () => {
    let token;
  
    beforeAll(async () => {
      execSync('npm run setup-db');
  
      await client.connect();
      const signInData = await fakeRequest(app)
        .post('/auth/signin')
        .send({
          email: 'choreguy@choredoer.com',
          password: '5678'
        });
      
      token = signInData.body.token; // eslint-disable-line
    }, 10000);
  
    afterAll(done => {
      return client.end(done);
    });


    test('GET /todo for choreguy', async() => {
      const expectation = [
        {
          id: 1,
          todo: 'wash the dishes',
          completed: false,
          user_id: 2
        },
        {
          id: 2,
          todo: 'walk the dog',
          completed: false,
          user_id: 2
        },
        {
          id: 3,
          todo: 'water the plants',
          completed: false,
          user_id: 2
        }
      ];

      const data = await fakeRequest(app)
        .get('/api/todos')
        .set('Authorization', token)
        .expect('Content-Type', /json/)
        .expect(200);

      expect(data.body).toEqual(expectation);
    });

    test('POST api/todos posts a new todo', async() => {
      const newTodo = {
        id: 4,
        todo: 'take out the garbage',
        completed: false,
        user_id: 2
      };
      
      const data = await fakeRequest(app)
        .post('/api/todos')
        .send(newTodo)
        .set('Authorization', token)
        .expect('Content-Type', /json/)
        .expect(200);
      expect(data.body).toEqual(newTodo);
    });
  });
});
