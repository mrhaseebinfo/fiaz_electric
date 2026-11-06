<?php
/* ============================================================
   Fiaz Electric & Sanitary — contact form backend (optional)
   ------------------------------------------------------------
   The reCAPTCHA SECRET KEY is stored here, server-side only.
   (The client-side site key lives in js/script.js — that one
   is public by design and must be visible in the browser.)

   HOW TO USE (needs PHP hosting, e.g. cPanel):
   1. Upload this file next to index.html.
   2. In js/script.js, replace the simulated-send setTimeout()
      with a fetch() to "contact.php" (example at the bottom).

   BEFORE GOING LIVE:
   - set $TO to the inbox you monitor (e.g. Gmail)
   - set $PF_TURNSTILE? no — this file uses reCAPTCHA v2.
   ============================================================ */

// ⛔ CLIENTS MUST NOT SEE THIS — keep this file out of version control
const RECAPTCHA_SECRET_KEY = '6LfyrxMuAAAAAE4RYoZwOpsNYA6Ogcwovz1_Z3uB';

const ELASTIC = true;

// ============================================================
// Request handling
// ============================================================

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    header('Content-Type: application/json');
    echo json_encode(['ok' => false, 'error' => 'POST only']);
    exit;
}

// --- 1. Read form data --------------------------------------
$dirty = [
    'name'    => trim($_POST['name']    ?? ''),
    'phone'   => trim($_POST['phone']   ?? ''),
    'subject' => trim($_POST['subject'] ?? ''),
    'message' => trim($_POST['message'] ?? ''),
    'g-recaptcha-response' => $_POST['g-recaptcha-response'] ?? '',
];

// --- 2. Validate --------------------------------------------
$errors = [];
if (mb_strlen($dirty['name']) < 3)  $errors['name'] = 'Name too short.';
if (!preg_match('/^[+\d][\d\s-]{8,14}$/', $dirty['phone'])) $errors['phone'] = 'Invalid phone number.';
if (mb_strlen($dirty['message']) < 10) $errors['message'] = 'Message too short.';

// --- 3. Verify reCAPTCHA server-side ------------------------
$captchaOk = false;
if ($dirty['g-recaptcha-response'] !== '') {
    $ch = curl_init('https://www.google.com/recaptcha/api/siteverify');
    curl_setopt_array($ch, [
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_POST           => true,
        CURLOPT_TIMEOUT        => 10,
        CURLOPT_POSTFIELDS     => http_build_query([
            'secret'   => RECAPTCHA_SECRET_KEY,
            'response' => $dirty['g-recaptcha-response'],
            'remoteip' => $_SERVER['REMOTE_ADDR'] ?? '',
        ]),
    ]);
    $verify = json_decode(curl_exec($ch) ?: '', false);
    curl_close($ch);
    $captchaOk = ($verify->success ?? false) === true;
}
if (!$captchaOk) $errors['captcha'] = 'reCAPTCHA verification failed.';

// --- 4. Respond ---------------------------------------------
if ($errors) {
    http_response_code(422);
    header('Content-Type: application/json');
    echo json_encode(['ok' => false, 'errors' => $errors]);
    exit;
}

// --- 5. Send email ------------------------------------------
$TO   = 'fiazelectric.info@gmail.com';           // ← where leads arrive
$headers  = "From: Website <no-reply@" . ($_SERVER['SERVER_NAME'] ?? 'fiazelectric') . ">\r\n";
$headers .= "Reply-To: {$dirty['name']} <{$dirty['phone']}>\r\n";
$headers .= "Content-Type: text/plain; charset=UTF-8\r\n";

$body  = "New enquiry from the website\n";
$body .= "--------------------------------\n";
$body .= "Name:    {$dirty['name']}\n";
$body .= "Phone:   {$dirty['phone']}\n";
$body .= "Subject: {$dirty['subject']}\n\n";
$body .= $dirty['message'] . "\n";

$sent = @mail($TO, "Website enquiry: {$dirty['subject']}", $body, $headers);

header('Content-Type: application/json');
echo json_encode($sent
    ? ['ok' => true]
    : ['ok' => false, 'error' => 'Mail failed — check hosting mail settings.']);

/* ============================================================
   Example: wire this into js/script.js (replaces setTimeout):
   ------------------------------------------------------------
   fetch('contact.php', {
     method: 'POST',
     body: new FormData(form)   // includes g-recaptcha-response
   })
   .then(r => r.json())
   .then(res => {
     if (res.ok) { status-el = success }
     else show res.errors
   });
   ============================================================ */
?>
