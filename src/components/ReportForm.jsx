import { useState } from "react";
import { auth, db } from "../firebase";
import { addDoc, collection } from "firebase/firestore";
import { toast } from "react-toastify";