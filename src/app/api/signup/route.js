import { NextResponse } from "next/server";
import { auth, db } from "../../../../firebaseconfig";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";

export async function POST(req) {
  try {
    const data = await req.json();

    const {
      name,
      email,
      password,
      address,
      phone,
      cnic,
      previousDiscipline,
      role,
      className,
    } = data;

    // 🔹 Validation
    if (!email || !password || !name || !role) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // 🔹 Create Firebase Auth user
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      email,
      password
    );
    const user = userCredential.user;

    // 🔹 Save user details in Firestore
    await setDoc(doc(db, "users", user.uid), {
      uid: user.uid,
      name,
      email,
      address: address || "",
      phone: phone || "",
      cnic: cnic || "",
      previousDiscipline: previousDiscipline || "",
      role: role || "student",
      className: className || null,
      createdAt: new Date().toISOString(),
    });

    console.log("✅ User created:", email, "→", role);

    return NextResponse.json({
      message: "User account created successfully",
      uid: user.uid,
      role,
      user: {
        name,
        email,
        role,
        className,
      },
    });
  } catch (error) {
    console.error("❌ Signup Error:", error.message);
    return NextResponse.json(
      { error: error.message || "User creation failed" },
      { status: 500 }
    );
  }
}
