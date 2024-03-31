import { Elysia, t } from "elysia";
import { createDb } from "./db";
import { faker } from "@faker-js/faker";

const app = new Elysia()
  .decorate("db", createDb())
  .get("/users",
    ({ db, query }) => {
      return db.query("SELECT * FROM users order by first_name desc limit $limit")
        .all({
          $limit: query.limit
        })
    },
    {
      query: t.Object({
        limit: t.Numeric()
      })
    })
  .post("/seed", ({ db }) => {
    const insertUser = db.prepare(
      "INSERT INTO users (first_name, last_name, email, about) VALUES ($first_name, $last_name, $email, $about) RETURNING *");

    for (let i = 0; i < 100; i++) {
      const insertedUser = insertUser.get({
        $first_name: faker.person.firstName(),
        $last_name: faker.person.lastName(),
        $email: faker.internet.email(),
        $about: faker.lorem.text()
      })

      console.log(`Inserted user ${insertedUser}`)

    }
    return "done"
  })
  .get('/users/:id', ({ db, params }) => {
    {
      const user_id = params.id
      console.log(`user info of ${user_id}`);

      return db.query("SELECT * FROM  users WHERE user_id=$user_id")
        .get({
          $user_id: user_id
        });


    }
  },
    // schema (object define and provide types)
    {
      params: t.Object({
        id: t.Numeric()
      })

    })
  .post("/users", ({ db, body }) => {
    const insertUser = db.prepare(
      "INSERT INTO users (first_name, last_name, email, about) VALUES ($first_name, $last_name, $email, $about) RETURNING *");
    return insertUser.get({
      $first_name: body.first_name,
      $last_name: body.last_name,
      $email: body.email,
      $about: body.about || ""
    })
  }, {
    body: t.Object({
      first_name: t.String(),
      last_name: t.String(),
      email: t.String(),
      about: t.Optional(t.String())
    })
  })
  .put('/users/:id', ({ db, body, params }) => {
    if (body.user_id) {

      const updateUser = db.prepare(
        "UPDATE users SET first_name = $first_name, last_name = $last_name, email = $email, about = $about WHERE user_id = $user_id"
      );
      return updateUser.run({
        $user_id: params.id,
        $first_name: body.first_name,
        $last_name: body.last_name,
        $email: body.email,
        $about: body.about || ""
      });
      



    }
  }, {
    body: t.Object({
      user_id: t.Integer(),
      first_name: t.String(),
      last_name: t.String(),
      email: t.String(),
      about: t.String()
    })
  })

  .listen(3000);


console.log(
  `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`
);
