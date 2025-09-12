/**
 * PocketBase Event Hooks Example
 * This file demonstrates various event hooks available in PocketBase
 */

// App-level hooks
$hooks.onBootstrap((e) => {
  console.log("🚀 PocketBase app is bootstrapping...");
  e.next();
});

$hooks.onSettingsReload((e) => {
  console.log("⚙️ App settings reloaded");
  e.next();
});

// Record hooks - User registration flow
$hooks.onRecordCreate((e) => {
  console.log(`📝 New record created in collection: ${e.record.collectionName}`);
  e.next();
}, "users");

$hooks.onRecordAfterCreateSuccess((e) => {
  console.log(`✅ User ${e.record.get("email")} registered successfully`);
  
  // Send welcome email
  const mailer = $app.newMailClient();
  const message = {
    from: "noreply@example.com",
    to: [e.record.get("email")],
    subject: "Welcome to our platform!",
    html: `
      <h1>Welcome ${e.record.get("name")}!</h1>
      <p>Thank you for joining our platform.</p>
    `
  };
  
  mailer.send(message).catch(console.error);
  e.next();
}, "users");

// Record validation hooks
$hooks.onRecordValidate((e) => {
  // Custom validation for posts
  if (e.record.collectionName === "posts") {
    const title = e.record.get("title");
    if (!title || title.length < 5) {
      throw new Error("Post title must be at least 5 characters long");
    }
  }
  e.next();
}, "posts");

// Record enrichment hooks
$hooks.onRecordEnrich((e) => {
  // Add computed fields for posts
  if (e.record.collectionName === "posts") {
    const content = e.record.get("content") || "";
    const wordCount = content.split(/\s+/).length;
    e.record.set("wordCount", wordCount);
    
    // Add reading time estimate
    const readingTime = Math.ceil(wordCount / 200); // 200 words per minute
    e.record.set("readingTime", readingTime);
  }
  e.next();
}, "posts");

// Collection hooks
$hooks.onCollectionCreate((e) => {
  console.log(`📁 New collection created: ${e.collection.name}`);
  e.next();
});

$hooks.onCollectionUpdate((e) => {
  console.log(`📝 Collection updated: ${e.collection.name}`);
  e.next();
});

// Request hooks for API monitoring
$hooks.onRequest((e) => {
  console.log(`🌐 API Request: ${e.requestInfo.method} ${e.requestInfo.path}`);
  e.next();
});

$hooks.onResponse((e) => {
  console.log(`📤 API Response sent for: ${e.requestInfo.path}`);
  e.next();
});

// Mailer hooks
$hooks.onMailerSend((e) => {
  console.log(`📧 Email sent to: ${e.message.to.join(", ")}`);
  console.log(`📧 Subject: ${e.message.subject}`);
  e.next();
});

// Realtime hooks
$hooks.onRealtimeConnectRequest((e) => {
  console.log(`🔌 Realtime client connected: ${e.client.id}`);
  e.next();
});

$hooks.onRealtimeSubscribeRequest((e) => {
  console.log(`📡 Client ${e.client.id} subscribing to: ${e.subscriptions.join(", ")}`);
  e.next();
});

// Backup hooks
$hooks.onBackupCreate((e) => {
  console.log(`💾 Creating backup: ${e.name}`);
  e.next();
});

$hooks.onBackupRestore((e) => {
  console.log(`🔄 Restoring backup: ${e.name}`);
  e.next();
});

// Termination hook
$hooks.onTerminate((e) => {
  console.log(`👋 PocketBase is shutting down. Restart: ${e.isRestart}`);
  e.next();
});
