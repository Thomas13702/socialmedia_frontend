import { useState } from "react";
import Layout from "@/components/Layout";
import firebaseClient from "../firebaseClient";
import firebase from "firebase/app";
import "firebase/auth";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import styles from "../styles/AuthForm.module.css";
import Link from "next/link";

export default function Login() {
  firebaseClient();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const userLogin = async (e) => {
    e.preventDefault();
    await firebase
      .auth()
      .signInWithEmailAndPassword(email, password)
      .then(() => {
        window.location.href = "/authenticated/home";
      })
      .catch((error) => {
        console.log(error);
        const message = error.message;
        toast.error(message);
      });
  };

  return (
    <Layout title="Login">
      <ToastContainer />
      <div className={styles.auth}>
        <h1>Login</h1>
        <div className={styles.card}>
          <form onSubmit={userLogin}>
            <label htmlFor="email">Enter email...</label>
            <input
              type="email"
              name="email"
              onChange={(e) => setEmail(e.target.value)}
              value={email}
              id="emailAddress"
            />
            <label htmlFor="password">Enter Password</label>
            <input
              type="password"
              name="password"
              onChange={(e) => setPassword(e.target.value)}
              value={password}
              id="password"
            />
            <Link href={"/forgottenPassword"}>Forgotten Your Password?</Link>
            <input className="btn" type="submit" value="Login" />
          </form>
          <p>
            Don&apos;t have an account?{" "}
            <Link href={"/register"}>Register Here</Link>
          </p>
        </div>
      </div>
    </Layout>
  );
}
