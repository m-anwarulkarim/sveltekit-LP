# Antigravity Design System & Agent Development Guidelines

## 1. MANDATORY: PLAN BEFORE EXECUTION (কাজ শুরুর আগে পরিকল্পনা প্রণয়ন)

যেকোনো নতুন ফিচার তৈরি, কোড রিফ্যাক্টরিং বা পেজ পরিবর্তনের পূর্বে **AGENT অবশ্যই একটি সুস্পষ্ট আর্কিটেকচারাল প্ল্যান (Plan) প্রস্তুত করবে**:
1. **Reusability Check (রিইউজেবিলিটি পরিকল্পনা):**
   - কাজটি কীভাবে করলে কোনো কোড ডুপ্লিকেট হবে না?
   - সাধারণ বা বারবার ব্যবহৃত UI অংশগুলোকে কীভাবে `_components/` এ আলাদা রিইউজেবল মডিউলে সাজানো যায়?
2. **User-Friendly UX (ইউজার ফ্রেন্ডলি এক্সপেরিয়েন্স):**
   - ব্যবহারকারী সহজে ও স্বাচ্ছন্দ্যে ফিচারটি ব্যবহার করতে পারবেন কি না?
   - অ্যাকশনের পর পর্যাপ্ত ভিজ্যুয়াল ফিডব্যাক (যেমন: টোস্ট মেসেজ, স্পিনার, হোভার ইফেক্ট, পরিষ্কার লেবেল) রাখা হয়েছে কি না?
   - মোবাইল ও ডেস্কটপ উভয় ডিভাইসেই রেসপন্সিভ লেআউট বজায় আছে কি না?
3. **Performance First (সুপার ফাস্ট ওয়েবসাইট):**
   - কোডের কারণে অপ্রয়োজনীয় রি-রেন্ডারিং (Re-rendering) বা সাইটের স্পিড ড্রপ হচ্ছে কি না?
   - Svelte 5 এর ফাইন-গ্রেইনড রিঅ্যাক্টিভিটি (`$state`, `$derived.by`) ব্যবহার করে সর্বোচ্চ পারফরম্যান্স নিশ্চিত করা।
   - অপ্রয়োজনীয় হেভি স্ক্রিপ্ট বা ডুপ্লিকেট বান্ডেল পরিহার করা।

---

## 2. Core Development Pillars (প্রধান মূলনীতিসমূহ)

### ক. Performance & Speed (সুপার ফাস্ট ও অপ্টিমাইজড ওয়েবসাইট)
- **Lightweight DOM:** অযথা নেস্টেড `<div>` বা অপ্রয়োজনীয় মার্কআপ পরিহার করুন।
- **Efficient Reactivity:** Svelte 5 এর আধুনিক রান্স (`$derived`, `$state`) ব্যবহার করুন, রিঅ্যাক্টিভ ক্যাসকেড নিয়ন্ত্রণ করুন।
- **Optimized Assets:** ইমেজ ও আইকনগুলোকে অপ্টিমাইজড ফরম্যাটে রাখুন যাতে পেজ লোডিং টাইম সর্বনিম্ন থাকে।

### খ. User-Friendly Interaction (সহজ ও সাবলীল ব্যবহারযোগ্যতা)
- **Instant Visual Feedback:** যেকোনো ফর্ম সাবমিট, ডেটা সেভ বা অ্যাকশনে স্পষ্ট টোস্ট (`showToast`) এবং লোডিং স্টেট দিন।
- **Mobile-First UX:** মোবাইল ভিউতে বটম ন্যাভিগেশন, পরিষ্কার টাচ-টার্গেট এবং সহজে স্ক্রোলযোগ্য চিপস নিশ্চিত করুন।
- **Intuitive Visual Hierarchy:** টাইপোগ্রাফিতে স্পষ্ট কন্ট্রাস্ট ও ফন্ট হায়ারার্কি বজায় রাখুন।

### গ. Reusability & Clean Architecture (রিইউজেবল ও মডুলার কোড)
- একই ধরণের কার্ড, টেবিল, হেডার বা ফর্ম একাধিক জায়গায় লাগলে তা কপি-পেস্ট না করে `_components/` এ রিইউজেবল কম্পোনেন্ট তৈরি করুন।
- বড় ডেটা ও টাইপগুলো বিজনেস ডোমেন অনুযায়ী আলাদা মডিউলে রাখুন (`_data/products.ts`, `_data/orders.ts`, `_data/catalog.ts`)।
- মনোলিথিক বিশাল ফাইল পরিহার করে কোডবেস ডিক্লেয়ারেটিভ ও পড়তে সহজ রাখুন।

---

## 3. UI Implementation: shadcn-svelte Priority with Practical Flexibility

1. **Default to shadcn-svelte for Standard UI**:
   - সবধরনের সাধারণ কন্ট্রোল, ফর্ম এবং লেআউটের জন্য `#lib/components/ui` থেকে ইনস্টলকৃত **shadcn-svelte** কম্পোনেন্ট ব্যবহার করতে হবে:
     - **Buttons**: `<Button variant="..." size="..." class="...">`
     - **Form Inputs**: `<Input bind:value={...} class="...">`
     - **Textareas**: `<Textarea bind:value={...} class="...">`
     - **Switches / Toggles**: `<Switch bind:checked={...} />`
     - **Badges**: `<Badge variant="...">`
     - **Modals / Dialogs**: `<Dialog>`, `<DialogContent>`, `<DialogHeader>`
     - **Cards & Panels**: `<Card>`, `<CardHeader>`, `<CardTitle>`, `<CardContent>`
     - **Data Tables**: `<Table>`, `<TableHeader>`, `<TableRow>`, `<TableCell>`
     - **Tabs**: `<Tabs>`, `<TabsList>`, `<TabsTrigger>`
     - **Alerts**: `<Alert>`, `<AlertTitle>`, `<AlertDescription>`
     - **Dropdown Menus**: `<DropdownMenu>`, `<DropdownMenuTrigger>`, `<DropdownMenuContent>`

2. **Practical Flexibility (প্রয়োজনে কাস্টম স্টাইলিংয়ের স্বাধীনতা)**:
   - যদি কোনো বিশেষ UI সেকশন, কাস্টম ড্র্যাগ-অ্যান্ড-ড্রপ, গ্রাফিকাল ক্যানভাস, কমপ্লেক্স রেসপন্সিভ ড্রপডাউন বা স্পেসিফিক উইজেট shadcn প্রিমিটিভ দিয়ে সহজে ও সুন্দরভাবে ম্যানেজ করা না যায়, তবে কোনো সমস্যা নেই — সেখানে সরাসরি পরিচ্ছন্ন **Tailwind CSS** ও কাস্টম **Svelte** মার্কআপ ব্যবহার করা সম্পূর্ণ অনুমোদিত।
   - মূল লক্ষ্য হলো সর্বোচ্চ কোড কোয়ালিটি, রিইউজেবিলিটি এবং দুর্দান্ত ইউজার এক্সপেরিয়েন্স বজায় রাখা।
