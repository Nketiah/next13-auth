"use client"
import React from "react"
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, SubmitHandler } from "react-hook-form"
import { signIn } from "next-auth/react"
import { useRouter } from 'next/navigation'


const loginSchema = z.object({
    email: z.string().email("Email must be a valid email address"),
    password: z.string()
    .min(3,"password must contain at least 3 character(s)")
    .max(6,"password must contain at most 6 character(s)")
})

type LoginSchemaType = z.infer<typeof loginSchema>



const Login = () => {

const { register, handleSubmit, watch, formState: { errors } } = useForm<LoginSchemaType>({resolver: zodResolver(loginSchema)})
const router = useRouter()    

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))


const onSubmit: SubmitHandler<LoginSchemaType> = async (data) => {
  const res: any = await signIn("credentials", {
    redirect: true,
    email: data.email,
    password: data.password,
    callbackUrl: "https://facebook.com",
  })

  if (res.error) {
    return  console.log("Errors  " + res.error)
  } else {
    return router.push("https://facebook.com");
  }
}



  return (
    <>
      <div className='flex justify-center items-center h-screen'>
        <div className='w-full max-w-md'>
          <form onSubmit={handleSubmit(onSubmit)} className='bg-white shadow-lg rounded-lg px-8 py-6'
           method="post"
           action="/api/auth/login/email"
           >
            <div>
              <input
                type='text'
                {...register("email")}
                className='w-full  py-4 px-2 block rounded-md border border-gray-400 outline-offset-2 outline-transparent focus:border-blue-500 focus:ring-blue-700 focus:ring-2 text-sm'
                style={{borderColor: errors?.email ? '#ED4337' : ''}}
              />
              <div className="text-red-700 mt-1">{errors?.email?.message}</div>
            </div>
            <br/>
            <div>
              <input
                type='password'
                {...register("password")}
                className='w-full  py-4 px-2 block rounded-md border border-gray-400 outline-offset-2 outline-transparent focus:border-blue-500 focus:ring-blue-700 focus:ring-2 text-sm'
                style={{borderColor: errors?.password ? '#ED4337' : ''}}
              />
              <div className="text-red-700 mt-1">{errors?.password?.message}</div>
            </div>
            <br />
            <div>
                <button type="submit" className="bg-gray-800 py-4 px-2  text-gray-100 w-full mb-5 rounded-md text-lg hover:bg-gray-700 focus:bg-gray-900">Make colors</button>
            </div>
          </form>
        </div>
      </div>
    </>
  )
}

export default Login
