/* src/components/Footer.tsx */
"use client";

import type { ReactNode } from "react";
import { motion } from "framer-motion";
import { withBasePath } from "@/lib/basePath";

const LINKS = {
  contacts: {
    phone: "+7 (995) 518-69-42",
    tg: "https://t.me/uni_smb",
    email: "mailto:uni.kit@mail.ru",
    issue: "https://t.me/uni_smb",
  },
  blog: {
    tgChannel: "https://t.me/uniconsulting",
    tenchat: "https://m.tenchat.ru/u/xuxnFlqD",
  },
  docs: {
    privacy: "/docs/privacy",
    opd: "/docs/opd-consent",
    offer: "/docs/offer",
    cookies: "/docs/cookies",
  },
};

function ExtLink({
  href,
  children,
  className = "",
}: {
  href: string;
  children: ReactNode;
  className?: string;
}) {
  const isHttp = href.startsWith("http");
  return (
    <a
      href={href}
      target={isHttp ? "_blank" : undefined}
      rel={isHttp ? "noreferrer" : undefined}
      className={`hover-accent transition-colors ${className}`}
    >
      {children}
    </a>
  );
}

function IntLink({
  href,
  children,
  className = "",
}: {
  href: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <a href={href} className={`hover-accent transition-colors ${className}`}>
      {children}
    </a>
  );
}

function RuBadge() {
  return (
    <div className="inline-flex">
      <div className="relative inline-flex rounded-[26px] p-[2px]">
        {/* один динамичный градиент-бордюр accent-1 -> accent-2 */}
        <motion.div
          aria-hidden
          className="pointer-events-none absolute inset-0 rounded-[26px] bg-gradient-to-r from-accent-1 via-accent-2 to-accent-1"
          style={{ backgroundSize: "260% 260%" }}
          animate={{ backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"] }}
          transition={{ duration: 6.8, ease: "linear", repeat: Infinity }}
        />

        <div className="relative inline-flex items-center gap-3 rounded-[24px] bg-accent-3 px-10 py-6">
          <span className="text-[18px] font-semibold text-text">RU</span>
          <span className="text-text/45">•</span>
          <span className="text-[18px] font-semibold text-text">
            Продукт сделан в России
          </span>
        </div>
      </div>
    </div>
  );
}

function Col({
  title,
  children,
  showDivider,
}: {
  title: string;
  children: ReactNode;
  showDivider?: boolean;
}) {
  return (
    <div className="relative min-w-0 px-10 lg:px-12 pt-10 lg:pt-12">
      {/* короткий вертикальный делитель, как в макете */}
      {showDivider ? (
        <div
          aria-hidden
          className="pointer-events-none absolute left-0 top-14 h-[230px] w-px bg-bg/18"
        />
      ) : null}

      <div className="hover-accent text-[26px] lg:text-[30px] font-extrabold text-bg">
        {title}
      </div>

      <div className="mt-7 space-y-4 text-[16px] font-medium text-bg/90">
        {children}
      </div>
    </div>
  );
}

export function Footer() {
  return (
    <footer id="footer" className="w-full">
      {/* TOP AREA: ровно 620px на lg (как макет 720: 620 + 100) */}
      <div className="w-full lg:h-[620px]">
        <div className="grid w-full lg:h-full lg:grid-cols-[480px_1px_1fr]">
          {/* LEFT (bg) */}
          <div className="bg-bg text-text">
            <div className="h-full px-10 lg:px-12 pt-10 lg:pt-12">
              {/* brand row */}
              <div className="flex items-center gap-4">
                {/* круглая рамка/маска */}
                <div className="h-14 w-14 shrink-0 rounded-full bg-accent-1 overflow-hidden flex items-center justify-center">
                  <img
                    src={withBasePath("/brand/uni-logo.svg")}
                    alt="ЮНИ"
                    className="h-[120%] w-[120%] object-contain"
                    draggable={false}
                  />
                </div>

                {/* текст строго по центру относительно круга */}
                <div className="min-w-0 flex flex-col justify-center">
                  <div className="hover-accent text-[20px] font-extrabold leading-none">
                    юни.ai
                  </div>
                  <div className="hover-accent mt-1 text-[14px] font-medium text-text/70 leading-snug">
                    Системы для SMB с ИИ
                  </div>
                </div>
              </div>

              {/* разделитель */}
              <div className="mt-8 h-px w-full bg-text/12" />

              {/* слоган */}
              <div className="hover-accent mt-8 text-[16px] font-medium text-text/80">
                СТЭП = Стабильность. Точность. Эффективность. Простота.
              </div>

              {/* реквизиты */}
              <div className="mt-10 space-y-3">
                <div className="hover-accent text-[16px] font-semibold text-text/85">
                  ООО БЭНИФИТ
                </div>
                <div className="hover-accent text-[16px] font-medium text-text/70">
                  ИНН: 7300031274 • ОГРН: 1247300003257
                </div>
                <div className="hover-accent text-[16px] font-medium text-text/70">
                  обл. Ульяновская, г. Ульяновск,
                  <br />
                  ул. Жигулевская, д. 17.
                </div>
              </div>

              {/* разделитель */}
              <div className="mt-10 h-px w-full bg-text/12" />

              {/* RU badge */}
              <div className="mt-10 pb-12">
                <RuBadge />
              </div>
            </div>
          </div>

          {/* MAIN VERTICAL DIVIDER */}
          <div aria-hidden className="hidden lg:block bg-text/12" />

          {/* RIGHT (top accent-1 + bottom text) */}
          <div className="min-w-0">
            {/* TOP RED: 472px */}
            <div className="relative bg-accent-1 text-bg lg:h-[472px] overflow-hidden">
              {/* watermark */}
              <div
                aria-hidden
                className="pointer-events-none select-none absolute inset-x-0 bottom-10 flex justify-center"
              >
                <div className="whitespace-nowrap text-bg/18 font-normal leading-none tracking-tight text-[140px] md:text-[170px] lg:text-[220px]">
                  衆志、城を成す
                </div>
              </div>

              <div className="relative z-10 grid md:grid-cols-3">
                <Col title="Блог">
                  <div>
                    <ExtLink href={LINKS.blog.tgChannel}>Telegram-канал</ExtLink>
                  </div>
                  <div>
                    <ExtLink href={LINKS.blog.tenchat}>TenChat</ExtLink>
                  </div>
                </Col>

                <Col title="Контакты" showDivider>
                  <div className="hover-accent">{LINKS.contacts.phone}</div>
                  <div>
                    <ExtLink href={LINKS.contacts.tg}>Telegram</ExtLink>
                  </div>
                  <div>
                    <ExtLink href={LINKS.contacts.email}>uni.kit@mail.ru</ExtLink>
                  </div>
                  <div>
                    <ExtLink href={LINKS.contacts.issue}>Сообщить о проблеме</ExtLink>
                  </div>
                </Col>

                <Col title="Документация" showDivider>
                  <div>
                    <IntLink href={LINKS.docs.privacy}>
                      Политика конфиденциальности
                    </IntLink>
                  </div>
                  <div>
                    <IntLink href={LINKS.docs.opd}>Согласие ОПД клиента</IntLink>
                  </div>
                  <div>
                    <IntLink href={LINKS.docs.offer}>Публичная оферта</IntLink>
                  </div>
                  <div>
                    <IntLink href={LINKS.docs.cookies}>Политика cookies</IntLink>
                  </div>
                </Col>
              </div>
            </div>

            {/* BOTTOM DARK: 148px */}
            <div className="bg-text text-bg lg:h-[148px]">
              {/* разделитель по границе красного/тёмного */}
              <div aria-hidden className="h-px w-full bg-bg/18" />

              <div className="h-full px-10 lg:px-12 flex items-center">
                <div className="h-px flex-1 bg-bg/18" />
                <a
                  href="#cta"
                  className="ml-10 hover-accent text-[22px] md:text-[26px] lg:text-[30px] font-extrabold tracking-tight whitespace-nowrap"
                >
                  начать проект
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* разделитель перед нижней полосой */}
        <div aria-hidden className="h-px w-full bg-text/12" />
      </div>

      {/* BOTTOM BAR (accent-2): 100px */}
      <div className="bg-accent-2 text-bg lg:h-[100px]">
        <div className="h-full px-10 lg:px-12 flex items-center justify-between">
          <div className="hover-accent text-[16px] font-medium">
            © 2026 (ООО "БЭНИФИТ")
          </div>
          <div className="hover-accent text-[16px] font-medium">
            Сделано ЮНИ.ai
          </div>
        </div>
      </div>
    </footer>
  );
}