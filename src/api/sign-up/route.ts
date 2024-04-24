import dbConnect from "@/lib/dbConnect";
import UserModel from "@/model/user";
import bcrypt from "bcryptjs"
import { sendVerificationEmails } from "@/helper/sendVerificationEmails";

export async function POST(request: Request) {
  await dbConnect();
  try {
    const { username, email, password } = await request.json();
    let isUserExistAndVerified = await UserModel.findOne({
      username,
      isVerified: true,
    });
    if (isUserExistAndVerified) {
      return Response.json(
        {
          success: false,
          message: "username is already taken",
        },
        {
          status: 400,
        }
      );
    }
    let isUserExistByEMail = await UserModel.findOne({ email });
    const verifyCode = Math.floor(100000 + Math.random() * 900000).toString();
    if (isUserExistByEMail) {
      if (isUserExistByEMail.isVerified) {
        return Response.json(
          {
            success: false,
            message:
              "User is allready verified. you can login via email and password",
          },
          { status: 400 }
        );
      } else {
        const hashedPassword = await bcrypt.hash(password, 10);
        isUserExistByEMail.password = hashedPassword;
        isUserExistByEMail.verifyCode = verifyCode;
        const expiryDate = new Date();
        expiryDate.setHours(expiryDate.getHours() + 1);
        isUserExistByEMail.verifyCodeExpiry = expiryDate;

        await isUserExistByEMail.save();
      }
    } else {
      const hashedPassword = await bcrypt.hash(password, 10);
      const expiryDate = new Date();
      expiryDate.setHours(expiryDate.getHours() + 1);
      const newUser = new UserModel({
        username: username,
        email: email,
        password: hashedPassword,
        verifyCode: verifyCode,
        verifyCodeExpiry: expiryDate,
        isVerified: false,
        isAcceptingMessage: true,
        messages: [],
      });
      await newUser.save();
    }
    // send verificationemail
    const emailResponse = await sendVerificationEmails(
      email,
      username,
      verifyCode
    );

    if (!emailResponse.success) {
      return Response.json(
        {
          success: false,
          message: emailResponse.message,
        },
        { status: 500 }
      );
    }
    return Response.json(
      {
        success: true,
        message: "Registered Successfully! please verify the email.",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("error while registering user : ", error);
    return Response.json(
      {
        success: false,
        message: "Error registering user",
      },
      {
        status: 500,
      }
    );
  }
}
