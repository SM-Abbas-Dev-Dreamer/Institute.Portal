import {
  createUserWithEmailAndPassword,
  fetchSignInMethodsForEmail,
} from "firebase/auth";
import {
  doc,
  getDocs,
  getDoc,
  collection,
  updateDoc,
  setDoc,
  query,
  where,
} from "firebase/firestore";
import { auth, db } from "../../../firebaseconfig";

// 🔹 Helper function: Generate Roll Number
const generateRollNumber = async () => {
  const counterRef = doc(db, "metadata", "rollNumberCounter");
  const docSnap = await getDoc(counterRef);

  if (docSnap.exists()) {
    const lastRoll = docSnap.data().lastRoll || 1000;
    const newRoll = lastRoll + 1;

    await updateDoc(counterRef, { lastRoll: newRoll });
    return newRoll.toString();
  } else {
    await setDoc(counterRef, { lastRoll: 1000 });
    return "1000";
  }
};

// 🔹 Helper function: Suggest Email
const suggestEmail = async (inputName) => {
  const emailDomain = "@web.com";
  if (!inputName) return "";

  let baseEmail = inputName.toLowerCase().replace(/\s+/g, "");
  let emailSuggestion = `${baseEmail}${emailDomain}`;

  const q = query(collection(db, "users"), where("email", "==", emailSuggestion));
  const querySnapshot = await getDocs(q);

  if (!querySnapshot.empty) {
    let counter = 1;
    let newEmail = `${baseEmail}${counter}${emailDomain}`;
    while (
      !(await getDocs(
        query(collection(db, "users"), where("email", "==", newEmail))
      )).empty
    ) {
      counter++;
      newEmail = `${baseEmail}${counter}${emailDomain}`;
    }
    emailSuggestion = newEmail;
  }

  return emailSuggestion;
};

// 🔹 Main API route (POST)
export async function POST(req) {
  try {
    const formData = await req.json();

    // Check if email exists
    const methods = await fetchSignInMethodsForEmail(auth, formData.email);
    if (methods.length > 0) {
      return Response.json({ error: "This email is already registered." }, { status: 400 });
    }

    // Create Auth User
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      formData.email,
      formData.password
    );
    const user = userCredential.user;

    // Generate roll number if student
    const rollNumber =
      formData.role === "student" ? await generateRollNumber() : null;

    // Save user in Firestore
    await setDoc(doc(db, "users", user.uid), {
      uid: user.uid,
      name: formData.name,
      email: formData.email,
      address: formData.address,
      phone: formData.phone,
      cnic: formData.cnic,
      previousDiscipline: formData.previousDiscipline,
      role: formData.role,
      className: formData.role === "student" ? formData.className : null,
      rollNumber,
      createdAt: new Date(),
    });

    return Response.json({ success: true, user });
  } catch (error) {
    console.error(error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}

export { suggestEmail };
