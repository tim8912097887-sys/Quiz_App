import request from "supertest";
import { v4 as uuidv4 } from 'uuid';
import { dbDisconnection, dbInitialization, dbQuery } from "@db/db.js"
import { app } from "@/app.js";
import { hashPassword } from "@/utilities/password.js";
import { generateOTP } from "@/utilities/otp.js";
import { futureDate } from "@/utilities/date.js";
import { createToken } from "@/utilities/token.js";
import { env } from "@/configs/env.js";

describe("Auth Integration test",() => {

    // Global data
    const username = "austin";
    const email = "tim8912097887@gmail.com";
    const password = "Aer3489!";
    // Initialize and close database globally
    beforeAll(async() => {
        await dbInitialization();
    },10000)
    afterAll(async() => {
        await dbDisconnection();
    },10000)
    
    describe("SignUp",() => {

        describe("Success",() => {
            // Clean up database for test isolation
            afterEach(async() => {
                    const deleteUsers = `DELETE FROM users`;
                    const deleteOtp = `DELETE FROM otp`;
                    await dbQuery("Delete User",deleteUsers,[]);
                    await dbQuery("Delete Otp",deleteOtp,[]);
            },10000)

            it('When Signup with valid data,should response with 201 statusCode and User object', async() => {
                // Arrange
                const userInfo = {
                    username,
                    email,
                    password
                }
                // Act
                const response = await request(app)
                                .post("/api/v1/auth/signup")
                                .send(userInfo);
                // Assertion
                expect(response.status).toBe(201);
                expect(response.body.error).toBeNull();
                expect(response.body.data.user).toMatchObject({
                    id: expect.any(Number),
                    username: expect.any(String),
                    email: expect.any(String)
                })
            },10000)

            it('When Signup with uppercase username,should response with 201 statusCode and lowercase username', async() => {
                // Arrange
                const userInfo = {
                    username: username.toUpperCase(),
                    email,
                    password
                }
                
                // Act
                const response = await request(app)
                                .post("/api/v1/auth/signup")
                                .send(userInfo);
                // Assertion
                expect(response.status).toBe(201);
                expect(response.body.error).toBeNull();
                expect(response.body.data.user).toMatchObject({
                    id: expect.any(Number),
                    username: username.toLowerCase(),
                    email: expect.any(String)
                })
            },10000)

            it('When Signup with uppercase email,should response with 201 statusCode and lowercase email', async() => {
                // Arrange
                const userInfo = {
                    username,
                    email: "Tim8912097887@gmail.com",
                    password
                }
                await new Promise(resolve => setTimeout(resolve, 1000));
                // Act
                const response = await request(app)
                                .post("/api/v1/auth/signup")
                                .send(userInfo);
                // Assertion
                expect(response.status).toBe(201);
                expect(response.body.error).toBeNull();
                expect(response.body.data.user).toMatchObject({
                    id: expect.any(Number),
                    username: expect.any(String),
                    email: email
                })
            },10000)
        })

        describe("Validation Fail",() => {

            afterAll(async() => {
                const deleteUsers = `DELETE FROM users`;
                await dbQuery("Delete User",deleteUsers,[]);
            },10000)
            // Invalid username
            it('When provide username less than two character,should response with 400 statusCode and Bad Request Error', async() => {
                // Arrange
                const userInfo = {
                    username: "e",
                    email,
                    password
                }
                // Act
                const response = await request(app)
                                .post("/api/v1/auth/signup")
                                .send(userInfo);
                // Assertion
                expect(response.status).toBe(400);
                expect(response.body.data).toBeNull();
                expect(response.body.error).toMatchObject({
                    status: "BadRequest",
                    code: 400,
                    detail: "Username at least two character"
                })
            })

            it('When provide username longer than sixty character,should response with 400 statusCode and Bad Request Error', async() => {
                // Arrange
                const userInfo = {
                    username: new Array(17).fill("sdf").join(","),
                    email,
                    password
                }
                // Act
                const response = await request(app)
                                .post("/api/v1/auth/signup")
                                .send(userInfo);
                // Assertion
                expect(response.status).toBe(400);
                expect(response.body.data).toBeNull();
                expect(response.body.error).toMatchObject({
                    status: "BadRequest",
                    code: 400,
                    detail: "Username at most sixty character"
                })
            })

            it('When provide username with ?,should response with 400 statusCode and Bad Request Error', async() => {
                // Arrange
                const userInfo = {
                    username: username+"?",
                    email,
                    password
                }
                // Act
                const response = await request(app)
                                .post("/api/v1/auth/signup")
                                .send(userInfo);
                // Assertion
                expect(response.status).toBe(400);
                expect(response.body.data).toBeNull();
                expect(response.body.error).toMatchObject({
                    status: "BadRequest",
                    code: 400,
                    detail: "Username can only contain letters, numbers, and underscores"
                })
            })
            // Invalid Email
            it('When provide invalid email,should response with 400 statusCode and Bad Request Error', async() => {
                // Arrange
                const userInfo = {
                    username,
                    email: "invalidemail",
                    password
                }
                // Act
                const response = await request(app)
                                .post("/api/v1/auth/signup")
                                .send(userInfo);
                // Assertion
                expect(response.status).toBe(400);
                expect(response.body.data).toBeNull();
                expect(response.body.error).toMatchObject({
                    status: "BadRequest",
                    code: 400,
                    detail: "Invalid Email"
                })
            })
            // Invalid Password
            it('When provide password less than eight character,should response with 400 statusCode and Bad Request Error', async() => {
                // Arrange
                const userInfo = {
                    username,
                    email,
                    password: "Qe25?"
                }
                // Act
                const response = await request(app)
                                .post("/api/v1/auth/signup")
                                .send(userInfo);
                // Assertion
                expect(response.status).toBe(400);
                expect(response.body.data).toBeNull();
                expect(response.body.error).toMatchObject({
                    status: "BadRequest",
                    code: 400,
                    detail: "Password at least eight character"
                })
            })

            it('When provide password longer than fifty character,should response with 400 statusCode and Bad Request Error', async() => {
                // Arrange
                const userInfo = {
                    username,
                    email,
                    password: password+new Array(6).fill("sodfjwef")
                }
                // Act
                const response = await request(app)
                                .post("/api/v1/auth/signup")
                                .send(userInfo);
                // Assertion
                expect(response.status).toBe(400);
                expect(response.body.data).toBeNull();
                expect(response.body.error).toMatchObject({
                    status: "BadRequest",
                    code: 400,
                    detail: "Password at most fifty character"
                })
            })

            it('When provide invalid password,should response with 400 statusCode and Bad Request Error', async() => {
                // Arrange
                const userInfo = {
                    username,
                    email,
                    password: "invalid89"
                }
                // Act
                const response = await request(app)
                                .post("/api/v1/auth/signup")
                                .send(userInfo);
                // Assertion
                expect(response.status).toBe(400);
                expect(response.body.data).toBeNull();
                expect(response.body.error).toMatchObject({
                    status: "BadRequest",
                    code: 400,
                    detail: "Password should include small and big letter and number and one special character"
                })
            })

            it('When provide not exist email,should response with 500 statusCode and Server Error', async() => {
                // Arrange
                const userInfo = {
                    username,
                    email: "notExist@email.com",
                    password
                }
                // Act
                const response = await request(app)
                                .post("/api/v1/auth/signup")
                                .send(userInfo);
                // Assertion
                expect(response.status).toBe(500);
                expect(response.body.data).toBeNull();
                expect(response.body.error).toMatchObject({
                    status: "ServerError",
                    code: 500,
                    detail: "Fail to send the email"
                })
            })
        })

        describe("Duplication Error",() => {

            // Clean up database for test isolation
            beforeAll(async() => {
                const queryString = `
                  INSERT INTO users (username,email,password)
                  VALUES ($1,$2,$3)
                `;
                const value = [username,email,password];
                const result = await dbQuery("Create User",queryString,value);
                expect(result.rowCount).toBe(1);
            },10000)
            afterAll(async() => {
                    const deleteUsers = `DELETE FROM users`;
                    await dbQuery("Delete User",deleteUsers,[]);
            },10000)

            it('When provide duplicate username,should response with 409 statusCode and Server Conflict Error', async() => {
                // Arrange
                const userInfo = {
                    username,
                    email: "nonduplicate@email.com",
                    password
                }
                // Act
                const response = await request(app)
                                .post("/api/v1/auth/signup")
                                .send(userInfo);
                // Assertion
                expect(response.status).toBe(409);
                expect(response.body.data).toBeNull();
                expect(response.body.error).toMatchObject({
                    status: "ServerConflict",
                    code: 409,
                    detail: "User already exist"
                })
            })

            it('When provide duplicate email,should response with 409 statusCode and Server Conflict Error', async() => {
                // Arrange
                const userInfo = {
                    username: "reaves",
                    email,
                    password
                }
                // Act
                const response = await request(app)
                                .post("/api/v1/auth/signup")
                                .send(userInfo);
                // Assertion
                expect(response.status).toBe(409);
                expect(response.body.data).toBeNull();
                expect(response.body.error).toMatchObject({
                    status: "ServerConflict",
                    code: 409,
                    detail: "User already exist"
                })
            })
        })
    })

    describe("Login",() => {
        
        // Create and delete user account 
        beforeAll(async() => {
            const queryString = `
               INSERT INTO users (username,email,password,is_verify)
               VALUES ($1,$2,$3,$4)
            `
            const hashedPassword = await hashPassword(password);
            const value = [username,email,hashedPassword,true];
            const result = await dbQuery("Create User",queryString,value);
            expect(result.rowCount).toBe(1);
        },10000);
        afterAll(async() => {
            const deleteUsers = `DELETE FROM users`;
            const deleteOtp = `DELETE FROM otp`;
            await dbQuery("Delete User",deleteUsers,[]);
            await dbQuery("Delete Otp",deleteOtp,[]);
        },10000)

        describe("Success",() => {

            it('When Login with valid and exist user,should response with 200 statusCode and User object', async() => {
                // Arrange
                const userInfo = {
                    email,
                    password
                }
                // Act
                const response = await request(app)
                                .post("/api/v1/auth/login")
                                .send(userInfo);
                // Assertion
                expect(response.status).toBe(200);
                expect(response.body.error).toBeNull();
                expect(response.body.data.user).toMatchObject({
                    id: expect.any(Number),
                    username: expect.any(String),
                    email: expect.any(String)
                })
            })

            it('When Login with Uppercase email,should response with 200 statusCode and lowercase email', async() => {
                // Arrange
                const userInfo = {
                    email: "Tim8912097887@gmail.com",
                    password
                }
                // Act
                const response = await request(app)
                                .post("/api/v1/auth/login")
                                .send(userInfo);
                // Assertion
                expect(response.status).toBe(200);
                expect(response.body.error).toBeNull();
                expect(response.body.data.user).toMatchObject({
                    id: expect.any(Number),
                    username: expect.any(String),
                    email
                })
            })
        })

        describe("Validation Fail",() => {
            // Invalid Email
            it('When provide invalid email,should response with 400 statusCode and Bad Request Error', async() => {
                // Arrange
                const userInfo = {
                    email: "invalidemail",
                    password
                }
                // Act
                const response = await request(app)
                                .post("/api/v1/auth/login")
                                .send(userInfo);
                // Assertion
                expect(response.status).toBe(400);
                expect(response.body.data).toBeNull();
                expect(response.body.error).toMatchObject({
                    status: "BadRequest",
                    code: 400,
                    detail: "Invalid Email"
                })
            })
            // Invalid Password
            it('When provide password less than eight character,should response with 400 statusCode and Bad Request Error', async() => {
                // Arrange
                const userInfo = {
                    email,
                    password: "Qe25?"
                }
                // Act
                const response = await request(app)
                                .post("/api/v1/auth/login")
                                .send(userInfo);
                // Assertion
                expect(response.status).toBe(400);
                expect(response.body.data).toBeNull();
                expect(response.body.error).toMatchObject({
                    status: "BadRequest",
                    code: 400,
                    detail: "Password at least eight character"
                })
            })

            it('When provide password longer than fifty character,should response with 400 statusCode and Bad Request Error', async() => {
                // Arrange
                const userInfo = {
                    email,
                    password: password+new Array(6).fill("sodfjwef")
                }
                // Act
                const response = await request(app)
                                .post("/api/v1/auth/login")
                                .send(userInfo);
                // Assertion
                expect(response.status).toBe(400);
                expect(response.body.data).toBeNull();
                expect(response.body.error).toMatchObject({
                    status: "BadRequest",
                    code: 400,
                    detail: "Password at most fifty character"
                })
            })

            it('When provide invalid password,should response with 400 statusCode and Bad Request Error', async() => {
                // Arrange
                const userInfo = {
                    email,
                    password: "invalid89"
                }
                // Act
                const response = await request(app)
                                .post("/api/v1/auth/login")
                                .send(userInfo);
                // Assertion
                expect(response.status).toBe(400);
                expect(response.body.data).toBeNull();
                expect(response.body.error).toMatchObject({
                    status: "BadRequest",
                    code: 400,
                    detail: "Password should include small and big letter and number and one special character"
                })
            })
        })

        describe("Auth Error",() => {

            it('When provide not exist Email,should response with 409 statusCode and Server Conflict Error', async() => {
                // Arrange
                const userInfo = {
                    email: "notExist@gmail.com",
                    password
                }
                // Act
                const response = await request(app)
                                .post("/api/v1/auth/login")
                                .send(userInfo);
                // Assertion
                expect(response.status).toBe(409);
                expect(response.body.data).toBeNull();
                expect(response.body.error).toMatchObject({
                    status: "ServerConflict",
                    code: 409,
                    detail: "Email or password is not correct"
                })
            })

            it('When provide exist email but not correct password,should response with 409 statusCode and Server Conflict Error', async() => {
                // Arrange
                const userInfo = {
                    email,
                    password: password+"2"
                }
                // Act
                const response = await request(app)
                                .post("/api/v1/auth/login")
                                .send(userInfo);
                // Assertion
                expect(response.status).toBe(409);
                expect(response.body.data).toBeNull();
                expect(response.body.error).toMatchObject({
                    status: "ServerConflict",
                    code: 409,
                    detail: "Email or password is not correct"
                })
            })

            it('When account not verified,should response with 401 statusCode and Unauthorization Error', async() => {
                // Arrange
                // Create non-verified user
                const newEmail = "new@gmail.com";
                const newUsername = "NewUser";
                const queryString = `
                INSERT INTO users (username,email,password)
                VALUES ($1,$2,$3)
                `
                const hashedPassword = await hashPassword(password);
                const value = [newUsername,newEmail,hashedPassword];
                const result = await dbQuery("Create User",queryString,value);
                expect(result.rowCount).toBe(1);
                const userInfo = {
                    email: newEmail,
                    password: password
                }
                // Act
                const response = await request(app)
                                .post("/api/v1/auth/login")
                                .send(userInfo);
                // Assertion
                expect(response.status).toBe(401);
                expect(response.body.data).toBeNull();
                expect(response.body.error).toMatchObject({
                    status: "Unauthorized",
                    code: 401,
                    detail: "Account not verify yet"
                })
            },10000)
    })
})
    describe("Verify Account",() => {

        describe("Success",() => {
              
                const code = generateOTP();
                // Create and delete user account and otp
                beforeEach(async() => {
                    const queryString = `
                    INSERT INTO users (username,email,password)
                    VALUES ($1,$2,$3)
                    `
                    const hashedPassword = await hashPassword(password);
                    const value = [username,email,hashedPassword];
                    const result = await dbQuery("Create User",queryString,value);
                    expect(result.rowCount).toBe(1);

                    const expired_at = futureDate(60).toString();
                    const otpQueryString = `
                    INSERT INTO otp (code,expired_at)
                    VALUES ($1,$2)
                    `
                    const otpValue = [code,expired_at];
                    const otpResult = await dbQuery("Create Otp",otpQueryString,otpValue);
                    expect(otpResult.rowCount).toBe(1);
                },10000);
                afterEach(async() => {
                    const deleteUsers = `DELETE FROM users`;
                    const deleteOtp = `DELETE FROM otp`;
                    await dbQuery("Delete User",deleteUsers,[]);
                    await dbQuery("Delete Otp",deleteOtp,[]);
                },10000)

              it('When verify with valid Otp and email,should response with 201 statusCode and UpdatedUser object', async() => {
                  // Arrange
                const userInfo = {
                    email,
                    otp: code
                }
                // Act
                const response = await request(app)
                                .post("/api/v1/auth/verification")
                                .send(userInfo);
                // Assertion
                expect(response.status).toBe(201);
                expect(response.body.error).toBeNull();
                expect(response.body.data.user).toMatchObject({
                    id: expect.any(Number),
                    username: expect.any(String),
                    email: expect.any(String)
                })
              })

              it('When verify with valid Otp and uppercase email,should response with 201 statusCode and Lowercase email', async() => {
                  // Arrange
                const userInfo = {
                    email: email.toUpperCase(),
                    otp: code
                }
                // Act
                const response = await request(app)
                                .post("/api/v1/auth/verification")
                                .send(userInfo);
                // Assertion
                expect(response.status).toBe(201);
                expect(response.body.error).toBeNull();
                expect(response.body.data.user).toMatchObject({
                    id: expect.any(Number),
                    username: expect.any(String),
                    email
                })
              })
        })

        describe("Validation Fail",() => {
            // Invalid Email
            it('When provide invalid email,should response with 400 statusCode and Bad Request Error', async() => {
                // Arrange
                const userInfo = {
                    email: "invalidemail",
                    otp: 324545
                }
                // Act
                const response = await request(app)
                                .post("/api/v1/auth/verification")
                                .send(userInfo);
                // Assertion
                expect(response.status).toBe(400);
                expect(response.body.data).toBeNull();
                expect(response.body.error).toMatchObject({
                    status: "BadRequest",
                    code: 400,
                    detail: "Invalid Email"
                })
            })
            // Invalid Otp
            it('When provide non-numeric otp,should response with 400 statusCode and Bad Request Error', async() => {
                // Arrange
                const userInfo = {
                    email,
                    otp: "dsfwef"
                }
                // Act
                const response = await request(app)
                                .post("/api/v1/auth/verification")
                                .send(userInfo);
                // Assertion
                expect(response.status).toBe(400);
                expect(response.body.data).toBeNull();
                expect(response.body.error).toMatchObject({
                    status: "BadRequest",
                    code: 400,
                    detail: "Otp should be number"
                })
            })
            it('When provide otp less than 100000,should response with 400 statusCode and Bad Request Error', async() => {
                // Arrange
                const userInfo = {
                    email,
                    otp: 89999
                }
                // Act
                const response = await request(app)
                                .post("/api/v1/auth/verification")
                                .send(userInfo);
                // Assertion
                expect(response.status).toBe(400);
                expect(response.body.data).toBeNull();
                expect(response.body.error).toMatchObject({
                    status: "BadRequest",
                    code: 400,
                    detail: "Minimal number is 100000"
                })
            })
            it('When provide otp greater than 999999,should response with 400 statusCode and Bad Request Error', async() => {
                // Arrange
                const userInfo = {
                    email,
                    otp: 9898988
                }
                // Act
                const response = await request(app)
                                .post("/api/v1/auth/verification")
                                .send(userInfo);
                // Assertion
                expect(response.status).toBe(400);
                expect(response.body.data).toBeNull();
                expect(response.body.error).toMatchObject({
                    status: "BadRequest",
                    code: 400,
                    detail: "Maximize number is 999999"
                })
            })
        })

        describe("Auth Error",() => {
 
            // Clean up otp
            afterAll(async() => {

            })
            it('When provide not exist otp,should response with 404 statusCode and Not Found Error', async() => {
                // Arrange
                const userInfo = {
                    email,
                    otp: 989898
                }
                // Act
                const response = await request(app)
                                .post("/api/v1/auth/verification")
                                .send(userInfo);
                // Assertion
                expect(response.status).toBe(404);
                expect(response.body.data).toBeNull();
                expect(response.body.error).toMatchObject({
                    status: "NotFound",
                    code: 404,
                    detail: "Code 989898 not exist"
                })
            })

            it('When provide expired otp,should response with 401 statusCode and Unauthorized Error', async() => {
                // Arrange
                const code = generateOTP();
                const expired_at = futureDate(0).toString();
                const otpQueryString = `
                    INSERT INTO otp (code,expired_at)
                    VALUES ($1,$2)
                `
                const otpValue = [code,expired_at];
                const otpResult = await dbQuery("Create Otp",otpQueryString,otpValue);
                expect(otpResult.rowCount).toBe(1);
                const userInfo = {
                    email,
                    otp: code
                }
                // Act
                const response = await request(app)
                                .post("/api/v1/auth/verification")
                                .send(userInfo);
                // Assertion
                expect(response.status).toBe(401);
                expect(response.body.data).toBeNull();
                expect(response.body.error).toMatchObject({
                    status: "Unauthorized",
                    code: 401,
                    detail: "Otp expired"
                })
            })
        })
    })

    describe("Get Otp",() => {

        beforeAll(async() => {
            const queryString = `
                    INSERT INTO users (username,email,password)
                    VALUES ($1,$2,$3)
            `
            const hashedPassword = await hashPassword(password);
            const value = [username,email,hashedPassword];
            const result = await dbQuery("Create User",queryString,value);
            expect(result.rowCount).toBe(1);
        },10000)
        afterAll(async() => {
            const deleteUsers = `DELETE FROM users`;
            await dbQuery("Delete User",deleteUsers,[]);
        },10000)
        describe("Success",() => {
   
            afterEach(async() => {
                const deleteOtp = `DELETE FROM otp`;
                await dbQuery("Delete Otp",deleteOtp,[]);
            },10000)
            it('When Successfully get otp,should response with 200 statusCode', async() => {
                // Arrange
                const userInfo = {
                    email
                }
                await new Promise(resolve => setTimeout(resolve, 1000));
                // Act
                const response = await request(app)
                                .post("/api/v1/auth/getotp")
                                .send(userInfo);
                // Assertion
                expect(response.status).toBe(200);
                expect(response.body.error).toBeNull();
                expect(response.body.data).toMatchObject({});
            },10000)
        })

        describe("Validation Fail",() => {
            // Invalid Email
            it('When provide invalid email,should response with 400 statusCode and Bad Request Error', async() => {
                // Arrange
                const userInfo = {
                    email: "invalidemail",
                }
                // Act
                const response = await request(app)
                                .post("/api/v1/auth/getotp")
                                .send(userInfo);
                // Assertion
                expect(response.status).toBe(400);
                expect(response.body.data).toBeNull();
                expect(response.body.error).toMatchObject({
                    status: "BadRequest",
                    code: 400,
                    detail: "Invalid Email"
                })
            })

            it('When provide not exist email,should response with 404 statusCode and Not Found Error', async() => {
                // Arrange
                const userInfo = {
                    email: "notexist@email.com",
                }
                // Act
                const response = await request(app)
                                .post("/api/v1/auth/getotp")
                                .send(userInfo);
                // Assertion
                expect(response.status).toBe(404);
                expect(response.body.data).toBeNull();
                expect(response.body.error).toMatchObject({
                    status: "NotFound",
                    code: 404,
                    detail: "User not exist"
                })
            })
        })
    })

    describe("Refresh Token",() => {

        describe("Success",() => {

            it('When successfully refresh token,should response with 200 statusCode and AccessToken', async() => {
                // Arrange
                const refreshToken = createToken({ id: 1,jwtid: uuidv4() },env.REFRESH_TOKEN_SECRET,Number(env.REFRESH_TOKEN_EXPIRED));
                // Act
                const response = await request(app)
                                .get("/api/v1/auth/refresh")
                                .set("Cookie",["refreshToken="+refreshToken]);
                // Assertion
                expect(response.status).toBe(200);
                expect(response.body.error).toBeNull();
                expect(response.body.data).toMatchObject({
                    accessToken: expect.any(String)
                })
            })
        })

        describe("Auth Error",() => {

            it('When not send with refresh token,should response with 401 statusCode and UnAuthorized Error', async() => {
                
                // Act
                const response = await request(app)
                                .get("/api/v1/auth/refresh");
                // Assertion
                expect(response.status).toBe(401);
                expect(response.body.data).toBeNull();
                expect(response.body.error).toMatchObject({
                    status: "Unauthorized",
                    code: 401,
                    detail: "Unauthicated"
                })
            })

            it('When send with expired refresh token,should response with 401 statusCode and UnAuthorized Error', async() => {
                // Arrange
                const refreshToken = createToken({ id: 1,jwtid: uuidv4() },env.REFRESH_TOKEN_SECRET,0);
                // Act
                const response = await request(app)
                                .get("/api/v1/auth/refresh")
                                .set("Cookie",["refreshToken="+refreshToken]);
                // Assertion
                expect(response.status).toBe(401);
                expect(response.body.data).toBeNull();
                expect(response.body.error).toMatchObject({
                    status: "Unauthorized",
                    code: 401,
                    detail: "Unauthicated"
                })
            })
        })
    
    })

    describe("Reset Password",() => {

        describe("Success",() => {
            const code = generateOTP();
            // Create and delete user account 
            beforeAll(async() => {
                const queryString = `
                INSERT INTO users (username,email,password,is_verify)
                VALUES ($1,$2,$3,$4)
                `
                const hashedPassword = await hashPassword(password);
                const value = [username,email,hashedPassword,true];
                const result = await dbQuery("Create User",queryString,value);
                expect(result.rowCount).toBe(1);
                
                const otpQueryString = `
                INSERT INTO otp (code,expired_at)
                VALUES ($1,$2)
                `
                const expired_at = futureDate(60).toString();
                const otpValue = [code,expired_at];
                const otpResult = await dbQuery("Create User",otpQueryString,otpValue);
                expect(otpResult.rowCount).toBe(1);
            },10000);
            afterAll(async() => {
                const deleteUsers = `DELETE FROM users`;
                const deleteOtp = `DELETE FROM otp`;
                await dbQuery("Delete User",deleteUsers,[]);
                await dbQuery("Delete Otp",deleteOtp,[]);
            },10000)
            it('When successfully reset the password,should response with 200 statusCode and Updated User and Login with new Password', async() => {
                // Arrange
                const resetPassword = password+"f";
                const userInfo = {
                    email,
                    password: resetPassword,
                    otp: code
                }
                // Act
                const response = await request(app)
                                .post("/api/v1/auth/resetpassword")
                                .send(userInfo);
                // Assertion
                expect(response.status).toBe(200);
                expect(response.body.error).toBeNull();
                expect(response.body.data.user).toMatchObject({
                    id: expect.any(Number),
                    username: expect.any(String),
                    email: expect.any(String)
                })
                // Arrange
                const loginInfo = {
                    email,
                    password: resetPassword
                }
                // Act
                const loginResponse = await request(app)
                                .post("/api/v1/auth/login")
                                .send(loginInfo);
                // Assertion
                expect(loginResponse.status).toBe(200);
                expect(loginResponse.body.error).toBeNull();
                expect(loginResponse.body.data.user).toMatchObject({
                    id: expect.any(Number),
                    username: expect.any(String),
                    email: expect.any(String)
                })

            },10000)
        })

        describe("Validation Fail",() => {
            const code = generateOTP();
            // Invalid Email
            it('When provide invalid email,should response with 400 statusCode and Bad Request Error', async() => {
                // Arrange
                const userInfo = {
                    email: "invalidemail",
                    password,
                    otp: code
                }
                // Act
                const response = await request(app)
                                .post("/api/v1/auth/resetpassword")
                                .send(userInfo);
                // Assertion
                expect(response.status).toBe(400);
                expect(response.body.data).toBeNull();
                expect(response.body.error).toMatchObject({
                    status: "BadRequest",
                    code: 400,
                    detail: "Invalid Email"
                })
            })
            // Invalid Password
            it('When provide password less than eight character,should response with 400 statusCode and Bad Request Error', async() => {
                // Arrange
                const userInfo = {
                    email,
                    password: "Qe25?",
                    otp: code
                }
                // Act
                const response = await request(app)
                                .post("/api/v1/auth/resetpassword")
                                .send(userInfo);
                // Assertion
                expect(response.status).toBe(400);
                expect(response.body.data).toBeNull();
                expect(response.body.error).toMatchObject({
                    status: "BadRequest",
                    code: 400,
                    detail: "Password at least eight character"
                })
            })

            it('When provide password longer than fifty character,should response with 400 statusCode and Bad Request Error', async() => {
                // Arrange
                const userInfo = {
                    email,
                    password: password+new Array(6).fill("sodfjwef"),
                    otp: code
                }
                // Act
                const response = await request(app)
                                .post("/api/v1/auth/resetpassword")
                                .send(userInfo);
                // Assertion
                expect(response.status).toBe(400);
                expect(response.body.data).toBeNull();
                expect(response.body.error).toMatchObject({
                    status: "BadRequest",
                    code: 400,
                    detail: "Password at most fifty character"
                })
            })

            it('When provide invalid password,should response with 400 statusCode and Bad Request Error', async() => {
                // Arrange
                const userInfo = {
                    email,
                    password: "invalid89",
                    otp: code
                }
                // Act
                const response = await request(app)
                                .post("/api/v1/auth/resetpassword")
                                .send(userInfo);
                // Assertion
                expect(response.status).toBe(400);
                expect(response.body.data).toBeNull();
                expect(response.body.error).toMatchObject({
                    status: "BadRequest",
                    code: 400,
                    detail: "Password should include small and big letter and number and one special character"
                })
            })
        })

        describe("Auth Error",() => {

            const code = generateOTP();
            // Create and delete user account 
            beforeAll(async() => {
                const queryString = `
                INSERT INTO users (username,email,password)
                VALUES ($1,$2,$3)
                `
                const hashedPassword = await hashPassword(password);
                const value = [username,email,hashedPassword];
                const result = await dbQuery("Create User",queryString,value);
                expect(result.rowCount).toBe(1);
            },10000);
            afterAll(async() => {
                const deleteUsers = `DELETE FROM users`;
                await dbQuery("Delete User",deleteUsers,[]);
            },10000)    

            it('When provide not exist email,should response with 404 statusCode and Not Found Error', async() => {
                // Arrange
                const userInfo = {
                    email: "notexist@gmail.com",
                    password,
                    otp: code
                }
                // Act
                const response = await request(app)
                                .post("/api/v1/auth/resetpassword")
                                .send(userInfo);
                // Assertion
                expect(response.status).toBe(404);
                expect(response.body.data).toBeNull();
                expect(response.body.error).toMatchObject({
                    status: "NotFound",
                    code: 404,
                    detail: "User not Found"
                })
            })

            it('When provide not verified email,should response with 401 statusCode and Unauthorized Error', async() => {
                // Arrange
                const userInfo = {
                    email,
                    password,
                    otp: code
                }
                // Act
                const response = await request(app)
                                .post("/api/v1/auth/resetpassword")
                                .send(userInfo);
                // Assertion
                expect(response.status).toBe(401);
                expect(response.body.data).toBeNull();
                expect(response.body.error).toMatchObject({
                    status: "Unauthorized",
                    code: 401,
                    detail: "Account not verify yet"
                })
            })
        })

        describe("Otp Error",() => {

            const code = generateOTP();
            // Create and delete user account 
            beforeAll(async() => {
                const queryString = `
                INSERT INTO users (username,email,password,is_verify)
                VALUES ($1,$2,$3,$4)
                `
                const hashedPassword = await hashPassword(password);
                const value = [username,email,hashedPassword,true];
                const result = await dbQuery("Create User",queryString,value);
                expect(result.rowCount).toBe(1);
                const otpQueryString = `
                INSERT INTO otp (code,expired_at)
                VALUES ($1,$2)
                `
                const expired_at = futureDate(0).toString();
                const otpValue = [code,expired_at];
                const otpResult = await dbQuery("Create User",otpQueryString,otpValue);
                expect(otpResult.rowCount).toBe(1);
            },10000);
            afterAll(async() => {
                const deleteUsers = `DELETE FROM users`;
                const deleteOtp = `DELETE FROM otp`;
                await dbQuery("Delete User",deleteUsers,[]);
                await dbQuery("Delete Otp",deleteOtp,[]);
            },10000)    

            it('When provide not exist otp,should response with 404 statusCode and Not Found Error', async() => {
                // Arrange
                const notExistOtp = ((code+1)>999999)?(code-2):(code+1);
                const userInfo = {
                    email,
                    password,
                    otp: notExistOtp
                }
                // Act
                const response = await request(app)
                                .post("/api/v1/auth/resetpassword")
                                .send(userInfo);
                // Assertion
                expect(response.status).toBe(404);
                expect(response.body.data).toBeNull();
                expect(response.body.error).toMatchObject({
                    status: "NotFound",
                    code: 404,
                    detail: `Code ${notExistOtp} not exist`
                })
            })

            it('When provide expired otp,should response with 401 statusCode and Unauthorized Error', async() => {
                // Arrange
                const userInfo = {
                    email,
                    password,
                    otp: code
                }
                // Act
                const response = await request(app)
                                .post("/api/v1/auth/resetpassword")
                                .send(userInfo);
                // Assertion
                expect(response.status).toBe(401);
                expect(response.body.data).toBeNull();
                expect(response.body.error).toMatchObject({
                    status: "Unauthorized",
                    code: 401,
                    detail: "Otp expired"
                })
            })
        })
    })
})