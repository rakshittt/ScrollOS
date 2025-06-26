CREATE TABLE IF NOT EXISTS "folders" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"color" text DEFAULT '#ff385c',
	"icon" text DEFAULT 'inbox',
	"is_system" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "newsletters" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"sender" text NOT NULL,
	"sender_email" text NOT NULL,
	"subject" text NOT NULL,
	"content" text NOT NULL,
	"html_content" text,
	"is_read" boolean DEFAULT false,
	"is_starred" boolean DEFAULT false,
	"is_archived" boolean DEFAULT false,
	"tags" text[],
	"folder" text DEFAULT 'inbox',
	"received_at" timestamp DEFAULT now(),
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "tags" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"color" text DEFAULT '#ff385c',
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "tags_name_unique" UNIQUE("name")
);
