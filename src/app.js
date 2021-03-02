require("dotenv").config();
const express = require("express");
const path = require("path");
const app = express();
const bcrypt = require("bcryptjs");
const cookieParser = require("cookie-parser");
require("./db/conn");

const hbs = require("hbs");
const Register = require("./modals/register");
const Article = require("./modals/blog");
const port = process.env.PORT || 3000;
const jwt = require("jsonwebtoken");

const static_path = path.join(__dirname, "../public/css");
const template_path = path.join(__dirname, "../templates/views");
const partials_path = path.join(__dirname, "../templates/partials");
const auth = require("./middleware/auth");

app.use(cookieParser());
app.use(express.static(static_path));
app.set("view engine", "hbs");
app.set("views", template_path);
hbs.registerPartials(partials_path);

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.get("/", (req, res) => {
    res.render("index");
});

app.get("/index", (req, res) => {
    res.render("index");
});

app.get("/secret", auth, async(req, res) => {
    // console.log(res.cookies.jwt);
    res.render("secret");
});

app.get("/blog", (req, res) => {
    res.render("blog");
});

app.get("/chat", (req, res) => {
    res.render("chat");
});

app.get("/logout", auth, async(req, res) => {
    try {
        //single logout
        // req.user.tokens = req.user.tokens.filter((currElement) => {
        //     return currElement.token != req.token;
        // });

        //multiple devices logout
        req.user.tokens = [];

        res.clearCookie("jwt");
        console.log("Successfully Logged out");

        await req.user.save();
        res.render("register");
    } catch (error) {
        res.status(500).send(Error);
    }
});

app.get("/register", (req, res) => {
    res.render("register");
});

app.post("/register", async(req, res) => {
    try {
        const password = req.body.password;
        const cpassword = req.body.confirmpassword;

        if (password === cpassword) {
            const registerUser = new Register({
                firstname: req.body.firstname,
                lastname: req.body.lastname,
                email: req.body.email,
                gender: req.body.gender,
                phone: req.body.age,
                age: req.body.age,
                password: req.body.password,
                confirmpassword: req.body.confirmpassword,
            });

            const token = await registerUser.generateAuthToken();
            console.log(token);

            res.cookie("jwt", token, {
                expires: new Date(Date.now() + 30000000),
                httpOnly: true,
            });

            const registered = await registerUser.save();
            res.status(201).render("index");
        } else {
            res.send("Password not matching");
        }
        console.log(req.body);
    } catch (error) {
        console.log(error);
    }
});

app.get("/login", (req, res) => {
    res.render("login");
});

app.post("/login", async(req, res) => {
    try {
        const email = req.body.email;
        const password = req.body.password;
        const usermail = await Register.findOne({ email: email });

        const isMatch = await bcrypt.compare(password, usermail.password);
        const token = await usermail.generateAuthToken();
        console.log(token);

        res.cookie("jwt", token, {
            expires: new Date(Date.now() + 30000),
            httpOnly: true,
            // secure: true,
        });

        if (isMatch) {
            res.status(201).render("chat");
        }
    } catch (error) {
        res.status(400).send("User Not Found");
    }
});
app.post("/blog", async(req, res) => {
    try {
        const registerBlog = new Article({
            title: req.body.title,
            author: req.body.author,
            content: req.body.content,
        });
        const registerblog = await registerBlog.save();
        alert("Blog Submitted");
        res.status(200).alert("Blog Submitted");
        console.log(registerblog);
    } catch (error) {
        res.status(500).send(error);
    }
});
app.get("/blog/:id", async(req, res) => {
    try {
        const _id = req.params.id;
        // console.log(title);
        const data = await Article.findById({ _id });
        console.log(data.title);
        res.render("blog", data);
        res.status(200).send(data.title);
    } catch (error) {
        console.log(error);
    }
});

app.delete("/blog/:id", async(req, res) => {
    try {
        const deleteArticle = await Article.findByIdAndDelete(req.params.id);

        console.log(req.params.id);
        if (!req.params.id) {
            return res.status(404).send("wrong request");
        } else {
            res.status(200).send("User Deleted");
        }
    } catch (error) {
        console.log(error);
    }
});

app.patch("/blog/:id", async(req, res) => {
    try {
        const _id = req.params.id;
        const dataUpdate = await Article.findByIndexAndUpdate(_id, req.body);
        res.send(dataUpdate);
        if (!registrationUser) {
            res.status(400).send("Wrong Request");
        } else {
            res.status(200).send(dataUpdate);
        }
    } catch (error) {
        res.status(404).send("Not Found");
    }
});

const pdfMake = require("../pdfmake/pdfmake");
const vfsFonts = require("../pdfmake/vfs_fonts");

pdfMake.vfs = vfsFonts.pdfMake;
app.post("/pdf", async(req, res) => {
    const fname = req.body.fname;
    const lname = req.body.lname;
    try {
        var documentDefinition = {
            content: [
                `Hello ${fname} ${lname},
                Nice to meet you sir`,
            ],
        };
        const pdfDoc = await pdfMake.createPdf(documentDefinition);
        pdfDoc.getBase64((data) => {
            res.writeHead(200, {
                "Content-Type": "application/pdf",
                "Content-Disposition": `attachment;filename="filename.pdf"`,
            });
            const download = Buffer.from(data.toString("utf-8"), "base64");
            res.end(download);
        });
    } catch (error) {
        console.log(error);
    }
});

// app.use('/pdfMake', )

app.get("/pdf", (req, res) => {
    res.render("pdf");
});

app.listen(port, () => {
    console.log("listening", port);
});