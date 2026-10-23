import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { CheckCircle2, XCircle, LoaderCircle, ArrowRight, Mail } from "lucide-react";
import api from "../services/api";

export default function VerifyEmail() {
  const [params] = useSearchParams();
  const [status, setStatus] = useState("loading");
  const [message, setMessage] = useState("Please wait while we verify your email.");
  
  useEffect(() => {
    let cancelled = false;
    const token = params.get("token");

    if (!token) {
      setStatus("error");
      setMessage("Verification link is missing or invalid.");
      return;
    }

    api
      .post("/api/auth/verify-email", { token })
      .then(({ data }) => {
        if (cancelled) return;
        setStatus("success");
        setMessage(data.message || "Your email has been verified successfully.");
      })
      .catch((error) => {
        if (cancelled) return;
        setStatus("error");
        setMessage(
          error.response?.data?.message ||
            "This verification link is invalid or has expired."
        );
      });

    return () => {
      cancelled = true;
    };
  }, [params]);

  const isSuccess = status === "success";
  const isError = status === "error";

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-gray-50 px-4 py-12">
      <div className="absolute -left-24 -top-24 h-72 w-72 rounded-full bg-gray-200/60 blur-3xl" />
      <div className="absolute -bottom-24 -right-24 h-72 w-72 rounded-full bg-gray-200/60 blur-3xl" />

      <div className="relative w-full max-w-md rounded-3xl border border-gray-200 bg-white p-8 text-center shadow-xl shadow-gray-200/50 sm:p-10">
        <Link
          to="/"
          className="mb-9 inline-flex items-center gap-2 text-lg font-bold tracking-tight text-gray-900"
        >
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-black text-white">
            <Mail size={19} />
          </span>
          WorkFlow AI
        </Link>

        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-gray-100">
          {status === "loading" && (
            <LoaderCircle size={38} className="animate-spin text-gray-800" />
          )}
          {isSuccess && (
            <CheckCircle2 size={42} className="text-green-600" />
          )}
          {isError && <XCircle size={42} className="text-red-500" />}
        </div>

        <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-gray-500">
          Account Security
        </p>

        <h1 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">
          {status === "loading"
            ? "Verifying your email"
            : isSuccess
              ? "Email verified!"
              : "Verification failed"}
        </h1>

        <p className="mx-auto mt-4 max-w-sm text-sm leading-6 text-gray-500">
          {message}
        </p>

        {isSuccess && (
          <Link
            to="/login"
            className="mt-8 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-black px-5 py-3.5 text-sm font-semibold text-white transition hover:bg-gray-800"
          >
            Continue to Login <ArrowRight size={17} />
          </Link>
        )}

        {isError && (
          <Link
            to="/register"
            className="mt-8 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-black px-5 py-3.5 text-sm font-semibold text-white transition hover:bg-gray-800"
          >
            Back to Register <ArrowRight size={17} />
          </Link>
        )}

        {status === "loading" && (
          <p className="mt-8 text-xs text-gray-400">
            Please keep this page open for a moment.
          </p>
        )}

        <div className="mt-8 border-t border-gray-100 pt-5">
          <p className="text-xs text-gray-400">
            Secure authentication · WorkFlow AI
          </p>
        </div>
      </div>
    </div>
  );
}
