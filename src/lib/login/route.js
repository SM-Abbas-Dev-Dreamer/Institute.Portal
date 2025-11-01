import { auth, db } from "../../../firebaseconfig";
import { signInWithEmailAndPassword } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";

export async function POST(req) {
  try {
    const { email, password, role } = await req.json();

    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    const docRef = doc(db, "users", user.uid);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
      return new Response(JSON.stringify({ error: "User not found" }), { status: 404 });
    }

    const userData = docSnap.data();

    if (userData.role !== role) {
      return new Response(JSON.stringify({ error: "Role mismatch" }), { status: 403 });
    }

    // ✅ Return UID + Role + Success
    return new Response(
      JSON.stringify({
        success: true,
        uid: user.uid,
        role: userData.role,
        user: userData,
      }),
      { status: 200 }
    );
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
}
