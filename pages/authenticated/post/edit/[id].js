import Layout from "@/components/Layout";
import styles from "@/styles/CreatePost.module.css";
import { useState } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.min.css";
import { API_URL } from "@/config/index";
import nookies from "nookies";
import { verifyIdToken } from "../../../../firebaseAdmin";
import firebaseClient from "../../../../firebaseClient";
import { useRouter } from "next/router";

export default function CreatePost({ cookies, token, post }) {
  firebaseClient();
  const router = useRouter();
  const [text, setText] = useState(post.text);

  const handleSubmit = async (e) => {
    e.preventDefault();
    //console.log(post);

    if (text === "") {
      toast.error("Please enter your post");
    }

    const res = await fetch(`${API_URL}/posts/updatePost/${post._id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${cookies.token}`,
      },
      body: JSON.stringify({ text }),
    });

    // console.log(res);

    if (!res.ok) {
      if (res.status === 403 || res.status === 401) {
        toast.error("No Token included");
        return;
      }

      toast.error("Something Went Wrong");
    } else {
      const resPost = await res.json(); //get data
      router.push("/authenticated/profile/account");
      toast.success("All Posted");
    }
  };

  if (token) {
    return (
      <Layout>
        <ToastContainer />
        <h1 className={styles.header}>Edit a Post</h1>
        <div>
          <form action="" className={styles.form} onSubmit={handleSubmit}>
            <textarea
              type="text"
              name="post"
              id="post"
              cols="100"
              rows="20"
              autoFocus
              maxLength="240"
              placeholder="Post Text..."
              value={text}
              onChange={(e) => setText(e.target.value)}
            ></textarea>
            <input type="submit" value="Post" className="btn" />
          </form>
        </div>
      </Layout>
    );
  } else {
    return <Layout>Loading ... </Layout>;
  }
}

export async function getServerSideProps(context) {
  try {
    const cookies = await nookies.get(context);
    const token = await verifyIdToken(cookies.token);

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
      props: { cookies, token, post },
    };
  } catch (err) {
    console.log(err);
    context.res.writeHead(302, { Location: "/login" });
    context.res.end();
    return { props: {} };
  }
}
