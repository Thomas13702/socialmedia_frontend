//Comment On a post

import { useState, useEffect } from "react";
import Layout from "@/components/Layout";
import nookies from "nookies";
import { verifyIdToken } from "../../../firebaseAdmin";
import firebaseClient from "../../../firebaseClient";
import { API_URL } from "@/config/index";
import PostItem from "@/components/PostItem";
import Comment from "@/components/Comment";
import styles from "@/styles/CommentPage.module.css";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.min.css";

export default function SlugProfile({ session, post, cookie, token }) {
  firebaseClient();
  const [text, setText] = useState("");
  const [comment, setComment] = useState([]);

  useEffect(() => {
    setComment(post.comments);
  }, []);

  const onSubmit = async (e) => {
    e.preventDefault();
    if (text === "") {
      toast.error("Please enter your post");
    }

    const res = await fetch(`${API_URL}/posts/comment/${post._id}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${cookie}`,
      },
      body: JSON.stringify({ text: text }),
    });

    //console.log(res);

    if (!res.ok) {
      if (res.status === 403 || res.status === 401) {
        toast.error("No Token included");
        return;
      }

      toast.error("Something Went Wrong");
    } else {
      const resText = await res.json(); //get data
      toast.success("Added Comment");
      setText("");
      setComment(resText);
      //comment.unshift(resText);
    }
  };

  if (session) {
    return (
      <Layout>
        <ToastContainer />
        <PostItem post={post} />
        <div className={styles.postForm}>
          <div className={styles.bgPrimary}>
            <h3>Leave a Comment...</h3>
          </div>
          <form className={styles.form} onSubmit={onSubmit}>
            <textarea
              name="text"
              cols="30"
              rows="5"
              maxLength="180"
              placeholder="Comment..."
              value={text}
              onChange={(e) => setText(e.target.value)}
              required
            />
            <input type="submit" className={styles.btn} value="Submit" />
          </form>

          {comment.map((com, index) => (
            <Comment
              key={index}
              comment={com}
              token={token}
              postID={post._id}
              cookie={cookie}
            />
          ))}
        </div>
      </Layout>
    );
  } else {
    return <Layout>Loading ... </Layout>;
  }
}

export async function getServerSideProps(context) {
  try {
    const cookies = nookies.get(context);
    const token = await verifyIdToken(cookies.token);
    const { uid, email } = token;

    const res = await fetch(
      `${API_URL}/posts/getPostByID/${context.params.id}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${cookies.token}`,
        },
      }
    );

    const post = await res.json();

    return {
      props: {
        session: `Your email is ${email} and your UID is ${uid}.`,
        post,
        cookie: cookies.token,
        token,
      },
    };
  } catch (err) {
    console.log(err);
    context.res.writeHead(302, { Location: "/login" });
    context.res.end();
    return { props: {} };
  }
}
