# Agent Architecture, Reusability & Performance Rules

## 1. MANDATORY: PLAN BEFORE EXECUTION (কাজ শুরুর আগে পরিকল্পনা প্রণয়ন)
যেকোনো নতুন ফিচার তৈরি, কোড রিফ্যাক্টরিং বা পেজ পরিবর্তনের পূর্বে **AGENT অবশ্যই একটি সুস্পষ্ট আর্কিটেকচারাল প্ল্যান (Plan) প্রস্তুত করবে**:
1. **Reusability Check:** কোড কীভাবে সাজালে ডুপ্লিকেশন ছাড়া রিইউজেবল মডিউল তৈরি হবে।
2. **User-Friendly UX:** ব্যবহারকারী যেন খুব সহজে ও স্বাচ্ছন্দ্যে ফিচারটি ব্যবহার করতে পারেন এবং অ্যাকশনের পর যথাযথ ফিডব্যাক পান।
3. **Performance First:** সাইটের লোডিং স্পিড ও পারফরম্যান্স যেন সর্বোচ্চ থাকে (Lightweight DOM & Svelte 5 Fine-grained Reactivity)।

---

## 2. Core Development Pillars
- **Performance:** সাইটের স্পিড যেন সুপার ফাস্ট থাকে; অতিরিক্ত রি-রেন্ডারিং পরিহার করুন।
- **User Experience:** স্পষ্ট ভিজ্যুয়াল ফিডব্যাক (টোস্ট, লোডিং স্টেট, রেসপন্সিভ ডিজাইন)।
- **Reusability:** ডুপ্লিকেট কোড পরিহার করে `_components/` এ রিইউজেবল কম্পোনেন্ট তৈরি করুন।

---

## 3. UI Principles: shadcn-svelte Priority with Practical Flexibility
1. **Default to shadcn-svelte for Standard UI**:
   - For all standard controls, forms, and layout blocks, use the installed **shadcn-svelte** components from `#lib/components/ui` (`Button`, `Input`, `Textarea`, `Switch`, `Badge`, `Dialog`, `Card`, `Table`, `Tabs`, `Alert`, `DropdownMenu`).
2. **Practical Flexibility (Custom UI Exception)**:
   - যদি কোনো বিশেষ UI সেকশন, কাস্টম ড্র্যাগ-অ্যান্ড-ড্রপ, জটিল ইন্টারেক্টিভ ক্যানভাস বা রেসপন্সিভ ড্রপডাউন shadcn দিয়ে সহজে বা সুন্দরভাবে হ্যান্ডেল করা না যায়, তবে কোনো সমস্যা নেই — সেখানে সরাসরি পরিচ্ছন্ন **Tailwind CSS** ও কাস্টম **Svelte** কোড ব্যবহার করা যাবে।
