console.log("woohoooo. sanity checking script.js");
//no ES6  in this file!!!
//i see this console.logs in the browser

(function () {
    Vue.component("my-first-component", {
        template: "#my-first-component",
        //tell component that it will be passed a props --> array of strings
        props: ["imageId"],
        data: function () {
            return {
                url: "",
                title: "",
                description: "",
                comments: [],
                username: "",
                comment: "",
                nextId: null,
                previousId: null,
            };
        },
        //mounted will run as soon as html is rendered on screen
        mounted: function () {
            //console.log("my component has mounted!!!!");
            //console.log("this in component: ", this);
            //console.log("this in component: ", this.imageId);
            let id = this.imageId;
            var that = this;
            //console.log("that in component");
            //i can use axios to make a request to server to get data
            this.getModalImage(this);
            axios
                .get(`/comments/${this.imageId}`)
                .then(function (resp) {
                    console.log(
                        "response in get comments: ",
                        resp.data.comments
                    );
                    console.log("that in get comments", that.comments);

                    that.comments = resp.data.comments;
                    console.log(that.comments);
                })
                .catch(function (err) {
                    console.log("err in Get modalImage: ", err);
                });
        },
        //adding watchers!!!
        watch: {
            //whenver the prop imageID changes, this function will run
            imageId: function () {
                console.log(
                    "message from watch: imageID changing!!!!",
                    this.imageId
                );
                var that = this;

                if (isNaN(this.imageId)) {
                    console.log("imageID  is not a number!!!");
                    that.$emit("close");
                } else {
                    //console.log("incluce get modalImage");
                    this.getModalImage(this);
                    axios
                        .get(`/comments/${this.imageId}`)
                        .then(function (resp) {
                            console.log(
                                "response in get comments: ",
                                resp.data.comments
                            );
                            console.log("that in get comments", that.comments);

                            that.comments = resp.data.comments;
                            console.log(that.comments);
                        })
                        .catch(function (err) {
                            console.log("err in Get modalImage: ", err);
                        });
                }
            },
        },

        //all event handlers go in here!!!
        methods: {
            clickButton: function (e) {
                e.preventDefault();
                //console.log("this in click button! ", this.username);
                //console.log("this in click button! ", this.comment);
                var that = this;
                //console.log("that image id: ", that.imageId);

                axios
                    .post(`/comments/${that.imageId}`, {
                        username: that.username,
                        comment: that.comment,
                    })
                    .then(function (resp) {
                        //console.log("there is a respnse from insert comment");
                        //console.log("that in comments post: ", that);
                        console.log(
                            "response in post comment",
                            resp.data.comment.comment
                        );

                        that.comment = resp.data.comment.comment;
                    })
                    .catch(function (err) {
                        console.log("error from post comments", err);
                    });
            },

            handleClose: function (e) {
                console.log("x was clicked!!");
                this.$emit("close");
            },

            getModalImage: function (arg) {
                var that = arg;
                console.log("getModalImage is running!!!");
                //console.log(("that in get Modal image:", that));

                axios
                    .get(`/modal/${that.imageId}`)

                    .then(function (resp) {
                        if (resp.data.image[0] == undefined) {
                            console.log("resp data image is undefined!!!!");
                            that.$emit("close");
                        } else {
                            //console.log("response in get modal image: ", resp);
                            console.log(
                                "resp.data.image in component modal: ",
                                resp.data.image[0]
                            );

                            that.url = resp.data.image[0].url;
                            that.title = resp.data.image[0].title;
                            that.description = resp.data.image[0].description;
                            that.nextId = resp.data.image[0].nextId;
                            that.previousId = resp.data.image[0].previousId;
                        }
                    })
                    .catch(function (err) {
                        console.log("err in Get modalImage: ", err);
                    });
            },
            handleDelete: function (e) {
                e.preventDefault();
                console.log("delete was clicked!!!");
                var that = this;
                axios
                    .get(`/delete/${this.imageId}`)
                    .then(function (resp) {
                        console.log("delete happened!!!");
                        that.$emit("close");
                        that.$emit("delete");
                    })
                    .catch(function (err) {
                        console.log("err in delete", err);
                    });
            },
        },
    });

    new Vue({
        el: "main",
        data: {
            heading: "I 😽 PIXELS",
            subheading: "Latest Images",
            cuteImages: [],

            //add property of animal that was clicked
            imageId: location.hash.slice(1),
            //use props to pass info down to child
            //these data properties will store values of input fields
            title: "",
            description: "",
            username: "",
            file: null,
            lastId: null,
            isNight: true,
        },
        mounted: function () {
            console.log("mounted is running!!!!");
            //console.log("this befrore then", this);
            var that = this;

            axios
                .get("/images")

                .then(function (resp) {
                    console.log("resp.data.cuteImages: ", resp.data.cuteImages);

                    that.cuteImages = resp.data.cuteImages;
                    console.log("that in get images", that.cuteImages);
                    let arr = that.cuteImages;
                    let arrLast = arr[arr.length - 1];
                    //console.log("arr Last", arrLast);
                    let lastId = arrLast.id;
                    //console.log(lastId);
                    that.lastId = lastId;
                    //console.log("that hopefully with lastId: ", that);
                })
                .catch(function (err) {
                    console.log("err in Get cuteImages: ", err);
                });
            //this code makes modal appear when I click different images because data property is being updated
            window.addEventListener("hashchange", function () {
                //console.log("hash change has fired!!!");
                console.log("location.hash", location.hash);
                if (isNaN(location.hash.slice(1))) {
                    console.log("imageID  is not a number!!!");
                    location.hash = "";
                } else {
                    that.imageId = location.hash.slice(1);
                }
            });
        },
        methods: {
            //add method for component showModal
            //and attach function to html
            closeModal: function () {
                //console.log("trying to use emit for closing");
                this.imageId = null;
                location.hash = "";
            },
            reloadPage: function () {
                var that = this;
                //console.log("that in reaload Page", that);
                console.log("reloading is happening!!!");

                axios
                    .get("/images")

                    .then(function (resp) {
                        console.log(
                            "resp.data.cuteImages: ",
                            resp.data.cuteImages
                        );

                        that.cuteImages = resp.data.cuteImages;
                        console.log(
                            "that in get images after deletting",
                            that.cuteImages
                        );
                        let arr = that.cuteImages;
                        let arrLast = arr[arr.length - 1];
                        console.log("arr Last", arrLast);
                        let lastId = arrLast.id;
                        console.log("lastId after delete", lastId);
                        that.lastId = lastId;
                        console.log(
                            "that hopefully with lastId after reloading: ",
                            that
                        );
                        that.isNight = true;
                    })
                    .catch(function (err) {
                        console.log("err in Get cuteImages: ", err);
                    });
            },

            handleClick: function (e) {
                e.preventDefault();
                console.log("this! ", this);

                /*
                cuteImages: Array(3)
                description: "a"
                file: File
                    name: "IMG_0239.JPG"
                    size: 1038994
                    type: image/jpeg
                    webkitRelativePath: ""
                heading
                subheading
                data: 
                    cuteImages: Array(3)
                    description: "a"
                    file: File
                    title: "a"
                    username: "a"
                */

                var formData = new FormData();
                formData.append("title", this.title);
                formData.append("description", this.description);
                formData.append("username", this.username);
                formData.append("file", this.file);

                var that = this;

                axios
                    .post("/upload", formData)
                    .then(function (resp) {
                        //console.log("that in upload post: ", that);
                        console.log(typeof that.cuteImages);

                        console.log(
                            "uuuuh, I am getting a response from upload!!!!"
                        );
                        //console.log("response from post upload ", resp);
                        //data: success: false (wenn ich kein Bild hochgeladen hab)
                        //data: {success: true}
                        //get data & put it in an array
                        //console.log("resp.data.image: ", resp.data.image);
                        //console.log("cute Images: ", that.cuteImages);
                        that.cuteImages.unshift(resp.data.image);
                    })
                    .catch(function (err) {
                        console.log("err from POST upload", err);
                    });
            },
            handleChange: function (e) {
                console.log("handleChange is running!");
                console.log("file: ", e.target.files[0]);
                /*
                file: 
                name: "IMG_0239.JPG"
                size: 1038994
                type: image/jpeg
                webkitRelativePath: ""
                */

                this.file = e.target.files[0];
            },
            handleMore: function (e) {
                e.preventDefault();
                //console.log("tthis in handleMore: ", this);
                //console.log("this lastId in handlemore! ", this.lastId);
                var that = this;

                //i can use axios to make a request to server to get data
                axios
                    .get(`/more/${this.lastId}`)

                    .then(function (resp) {
                        //console.log("response in handleMore: ", resp);

                        that.cuteImages.push(...resp.data.moreImages);
                        console.log("that.cuteImages, ", that.cuteImages);

                        //figuring out lastId now
                        let arr = that.cuteImages;
                        let arrLast = arr[arr.length - 1];
                        //console.log("arr Last", arrLast);
                        let lastId = arrLast.id;
                        //console.log(lastId);
                        that.lastId = lastId;

                        //getting the lowest id
                        console.log(
                            "lowest id in lastId-picture",
                            arrLast.lowestId
                        );
                        if (lastId == arrLast.lowestId) {
                            console.log("lowest id on the screeen!!!!!");
                            that.isNight = false;
                        }
                    })
                    .catch(function (err) {
                        console.log("err in Get comments: ", err);
                    });
            },
        },
    });
})();
