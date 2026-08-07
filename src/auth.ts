import * as bcrypt from 'bcryptjs'
import { GenerateToken, Delay } from "./helpers"
import { Env } from "./interfaces"
import { version } from "./variables"

export async function GetLogin(request: Request, env: Env): Promise<Response> {
  const url: URL = new URL(request.url)
  let htmlMessage = ""
  const message = url.searchParams.get("message")
  if (message == "error") {
    htmlMessage = `<div class="p-3 bg-danger text-white fw-bold text-center">Invalid password / کلمه عبور معتبر نمی‌باشد!</div>`
  }

  const htmlContent = `
  <!DOCTYPE html>
  <html>
    <head>
      <meta charset="utf8" />
      <link rel="shortcut icon" type="image/ico" href="https://dash.cloudflare.com/favicon.ico" />
      <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.1/dist/css/bootstrap.min.css" rel="stylesheet" integrity="sha384-4bw+/aepP/YC94hEpVNVgiZdgIC5+VKNBQNGCHeKRQN+PtmoHDEXuppvnDJzQIu9" crossorigin="anonymous">
      <link rel="preconnect" href="https://fonts.googleapis.com">
      <link href="https://fonts.googleapis.com/css2?family=Vazirmatn:wght@400;600;700&family=Inter:wght@400;600;700&display=swap" rel="stylesheet">
      <style>
        :root {
          --matix-bg: #0d0e1a;
          --matix-panel: #14162b;
          --matix-border: #2a2e52;
          --matix-accent: #7c5cff;
          --matix-accent-2: #22d3ee;
          --matix-text: #e6e7f0;
        }
        * { font-family: 'Inter', 'Vazirmatn', sans-serif; box-sizing: border-box; }
        html, body { height: 100%; margin: 0; }
        body {
          background: radial-gradient(1200px 600px at 10% -10%, #221f4a 0%, transparent 60%),
                      radial-gradient(1000px 500px at 110% 10%, #0e2e3a 0%, transparent 55%),
                      var(--matix-bg) !important;
          color: var(--matix-text) !important;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
        }
        .container {
          background: var(--matix-panel) !important;
          border: 1px solid var(--matix-border) !important;
          border-radius: 16px !important;
          box-shadow: 0 20px 60px rgba(0,0,0,0.45);
          overflow: hidden;
          max-width: 480px;
        }
        .bg-primary {
          background: linear-gradient(120deg, rgba(124,92,255,0.25), rgba(34,211,238,0.15)) !important;
        }
        .bg-primary .fs-4 {
          background: linear-gradient(90deg, var(--matix-accent), var(--matix-accent-2));
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          font-weight: 700;
        }
        .bg-primary .fs-6 { color: var(--matix-text) !important; opacity: 0.8; }
        .bg-danger { background: #ef4444 !important; }
        .form-control {
          background-color: #0f1126 !important;
          color: var(--matix-text) !important;
          border: 1px solid var(--matix-border) !important;
          border-radius: 8px !important;
        }
        .form-control:focus { border-color: var(--matix-accent) !important; box-shadow: 0 0 0 .2rem rgba(124,92,255,0.25) !important; }
        .btn-primary {
          background: linear-gradient(90deg, var(--matix-accent), #6d5bff) !important;
          border: none !important;
          border-radius: 8px !important;
          font-weight: 600;
        }
        .btn-primary:hover { filter: brightness(1.1); }
      </style>
    </head>
    <body dir="ltr">
      <div class="container border p-0">
        <div class="p-4 bg-primary text-white text-center">
          <div class="text-nowrap fs-4">⚡ Matix Panel</div>
          <div class="text-nowrap fs-6">
            Version ${version}
          </div>
        </div>
        ${htmlMessage}
        <form class="p-4 row g-3" method="post">
          <div class="col-12">
            Enter password / کلمه‌ی عبور را وارد کنید:
          </div>
          <div class="col-12">
            <label for="inputPassword2" class="visually-hidden">Password</label>
            <input type="password" class="form-control" id="inputPassword2" placeholder="Password" name="password" minlength="6" required>
          </div>
          <div class="col-12">
            <button type="submit" class="btn btn-primary w-100 mb-2">Confirm identity / تایید هویت</button>
          </div>
        </form>
      </div>
    </body>
  </html>
  `

  return new Response(htmlContent, {
    headers: {"Content-Type": "text/html"},
  })
}

export async function PostLogin(request: Request, env: Env): Promise<Response> {
  const url: URL = new URL(request.url)
  const formData = await request.formData()
  const password: string = formData.get("password") || ""
  let hashedPassword: string = await env.settings.get("Password") || ""

  await Delay(1000)

  const match = await bcrypt.compare(password, hashedPassword)
    
  if (match) {
    const token: string = GenerateToken(24)
    await env.settings.put("Token", token)
    return Response.redirect(`${url.protocol}//${url.hostname}${url.port != "443" ? ":" + url.port : ""}/?token=${token}`, 302)
  }

  return Response.redirect(`${url.protocol}//${url.hostname}${url.port != "443" ? ":" + url.port : ""}/login?message=error`, 302)
}
