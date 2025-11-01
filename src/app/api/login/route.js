import { NextResponse } from "next/server";
import { auth, db } from "../../../../firebaseconfig";
import { signInWithEmailAndPassword } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";

export async function POST(req) {
  try {
    // 🔹 Parse request body
    const { email, password, role } = await req.json();

    if (!email || !password || !role) {
      return NextResponse.json(
        { error: "Missing email, password, or role" },
        { status: 400 }
      );
    }

    // 🔹 Firebase Login
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // 🔹 Fetch user data from Firestore
    const docRef = doc(db, "users", user.uid);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
      return NextResponse.json(
        { error: "User not found in Firestore" },
        { status: 404 }
      );
    }

    const userData = docSnap.data();

    // 🔹 Role mismatch check
    if (userData.role !== role) {
      return NextResponse.json(
        { error: "Role mismatch — please select correct role" },
        { status: 403 }
      );
    }

    // 🔹 Response data
    return NextResponse.json({
      message: "Login successful",
      uid: user.uid,
      role: userData.role,
      user: {
        name: userData.name || "Unknown",
        email: userData.email || email,
      },
    });
  } catch (error) {
    console.error("❌ Login Error:", error.message);
    return NextResponse.json(
      { error: error.message || "Login failed" },
      { status: 500 }
    );
  }
}
