const database = "tafe-weather-api";
use(database);
db; // "tafe-weather-api"

// Create users collections with validator
db.createCollection("users", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      title: "user object validation",
      required: [
        "username",
        "password",
        "firstName",
        "lastName",
        "emailAddress",
        "phone",
        "role",
        "status",
      ],
      properties: {
        username: {
          bsonType: "string",
          minLength: 3,
          maxLength: 50,
          description: "Must be a string and required, 1-50 characters",
        },
        password: {
          bsonType: "string",
          maxLength: 255,
          description: "Must be a string and required, 8-50 characters",
        },
        firstName: {
          bsonType: "string",
          minLength: 2,
          maxLength: 50,
          description: "Must be a string and required, 2-50 characters",
        },
        lastName: {
          bsonType: "string",
          minLength: 2,
          maxLength: 50,
          description: "Must be a string and required, 2-50 characters",
        },
        emailAddress: {
          bsonType: "string",
          minLength: 5,
          maxLength: 200,
          pattern: "^[^@\\s]+@[^@\\s]+\\.[^@\\s]+$",
          description: "Must be a string and required, 5-200 characters",
        },
        phone: {
          bsonType: "string",
          pattern: "^0[2-478]\\d{8}$",
          description:
            "Phone number must be 10 digits without spaces and special charachters",
        },
        role: {
          bsonType: "array",
          minItems: 1,
          uniqueItems: true,
          items: {
            type: "string",
            enum: ["teacher", "student", "admin", "sensor"],
            description:
              'Each role must be one of "teacher", "student", "admin", or "sensor".',
          },
          description:
            'Exaustive combination of array of user roles ["teacher", "student", "admin", "sensor"]',
        },
        status: {
          bsonType: "string",
          enum: ["active", "inactive"],
          description: 'Status must be either "active" or "inactive".',
        },
        createdAt: {
          bsonType: "date",
          description: "Date when the user was created.",
        },
        updatedAt: {
          bsonType: "date",
          description: "Date when the user was last updated.",
        },
        lastLoggedInAt: {
          bsonType: "date",
          description: "Date when the user last logged in.",
        },
      },
      additionalProperties: false,
    },
  },
});