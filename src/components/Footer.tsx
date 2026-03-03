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
      className={`transition-colors ${className}`}
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
    <a href={href} className={`transition-colors ${className}`}>
      {children}
    </a>
  );
}

function RuBadge() {
  return (
    <div className="inline-flex">
      <div className="relative inline-flex rounded-[26px] p-[2px]">
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
      {showDivider ? (
        <div
          aria-hidden
          className="pointer-events-none absolute left-0 top-0 h-[270px] w-px bg-bg/20"
        />
      ) : null}

      <div className="text-[20px] font-extrabold text-bg">{title}</div>

      <div className="mt-6 space-y-4 text-[14px] font-medium">{children}</div>
    </div>
  );
}

export function Footer() {
  return (
    <footer
      id="footer"
      className={[
        "relative w-full overflow-x-clip",
        "-mb-12 md:-mb-20",
      ].join(" ")}
    >
      <div className="mx-auto w-full lg:w-[1440px]">
        {/* TOP AREA: 620px */}
        <div className="relative w-full lg:h-[620px]">
          {/* вертикальная граница 480 | 960 */}
          <div
            aria-hidden
            className="pointer-events-none absolute left-[480px] top-0 hidden h-full w-px bg-text/20 lg:block"
          />

          <div className="grid w-full lg:h-full lg:grid-cols-[480px_960px]">
            {/* LEFT (bg): 480x620 */}
            <div className="bg-bg text-text">
              <div className="h-full px-10 lg:px-12 pt-[57px] pb-[57px]">
                <div className="flex items-center gap-4">
                  <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-full bg-accent-1">
                    <img
                      src={withBasePath("/brand/uni-logo.svg")}
                      alt="ЮНИ"
                      className="h-[120%] w-[120%] object-contain"
                      draggable={false}
                    />
                  </div>

                  <div className="min-w-0 flex flex-col justify-center">
                    <div className="hover-accent text-[20px] font-extrabold leading-none">
                      ЮНИ.ai
                    </div>
                    <div className="hover-accent mt-1 text-[14px] font-medium leading-snug text-text/70">
                      Системы для SMB с ИИ
                    </div>
                  </div>
                </div>

                {/* divider #1 */}
                <div className="relative mt-[57px] h-px">
                  <div
                    aria-hidden
                    className={[
                      "absolute inset-y-0 right-0 bg-text/20",
                      "left-0",
                      "lg:left-[calc(-1*(100vw-1440px)/2)]",
                    ].join(" ")}
                  />
                </div>

                <div className="mt-[57px] text-[14px] leading-[1.75] text-text/80">
                  <div className="hover-accent font-semibold text-text/85">
                    ООО БЭНИФИТ
                  </div>
                  <div className="hover-accent font-medium">
                    ИНН: 7300031274 • ОГРН: 1247300003257
                  </div>
                  <div className="hover-accent font-medium">
                    обл. Ульяновская, г. Ульяновск,
                  </div>
                  <div className="hover-accent font-medium">
                    ул. Жигулевская, д. 17.
                  </div>
                </div>

                {/* divider #2 */}
                <div className="relative mt-[57px] h-px">
                  <div
                    aria-hidden
                    className={[
                      "absolute inset-y-0 right-0 bg-text/20",
                      "left-0",
                      "lg:left-[calc(-1*(100vw-1440px)/2)]",
                    ].join(" ")}
                  />
                </div>

                {/* RU badge */}
                <div className="relative mt-[57px] top-[4px]">
                  <RuBadge />
                </div>
              </div>
            </div>

            {/* RIGHT: 960x620 */}
            <div className="min-w-0">
              {/* TOP RED */}
              <div className="relative text-bg lg:h-[470px]">
                <div
                  aria-hidden
                  className="pointer-events-none absolute inset-y-0 left-0 bg-accent-1"
                  style={{
                    right: "min(0px, calc((100vw - 1440px) / -2))",
                  }}
                />

                <div className="relative h-full overflow-hidden">
                  {/* watermark */}
                  <div
                    aria-hidden
                    className="pointer-events-none absolute left-1/2 top-[72%] -translate-x-1/2 -translate-y-1/2 select-none"
                  >
                    <div className="relative top-[16px] whitespace-nowrap text-[118px] font-normal leading-none tracking-tight text-bg/18">
                      衆志、城を成す
                    </div>
                  </div>

                  <div className="relative z-10 grid md:grid-cols-3">
                    <Col title="Блог">
                      <div>
                        <ExtLink
                          href={LINKS.blog.tgChannel}
                          className="text-accent-3 duration-300 hover:text-text"
                        >
                          Telegram-канал
                        </ExtLink>
                      </div>
                      <div>
                        <ExtLink
                          href={LINKS.blog.tenchat}
                          className="text-accent-3 duration-300 hover:text-text"
                        >
                          TenChat
                        </ExtLink>
                      </div>
                    </Col>

                    <Col title="Контакты" showDivider>
                      <div className="text-accent-3 transition-colors duration-300 hover:text-text">
                        {LINKS.contacts.phone}
                      </div>
                      <div>
                        <ExtLink
                          href={LINKS.contacts.tg}
                          className="text-accent-3 duration-300 hover:text-text"
                        >
                          Telegram
                        </ExtLink>
                      </div>
                      <div>
                        <ExtLink
                          href={LINKS.contacts.email}
                          className="text-accent-3 duration-300 hover:text-text"
                        >
                          uni.kit@mail.ru
                        </ExtLink>
                      </div>
                      <div>
                        <ExtLink
                          href={LINKS.contacts.issue}
                          className="text-accent-3 duration-300 hover:text-text"
                        >
                          Сообщить о проблеме
                        </ExtLink>
                      </div>
                    </Col>

                    <Col title="Документация" showDivider>
                      <div>
                        <IntLink
                          href={LINKS.docs.privacy}
                          className="text-accent-3 duration-300 hover:text-text"
                        >
                          Политика конфиденциальности
                        </IntLink>
                      </div>
                      <div>
                        <IntLink
                          href={LINKS.docs.opd}
                          className="text-accent-3 duration-300 hover:text-text"
                        >
                          Согласие ОПД клиента
                        </IntLink>
                      </div>
                      <div>
                        <IntLink
                          href={LINKS.docs.offer}
                          className="text-accent-3 duration-300 hover:text-text"
                        >
                          Публичная оферта
                        </IntLink>
                      </div>
                      <div>
                        <IntLink
                          href={LINKS.docs.cookies}
                          className="text-accent-3 duration-300 hover:text-text"
                        >
                          Политика cookies
                        </IntLink>
                      </div>
                    </Col>
                  </div>
                </div>
              </div>

              {/* BOTTOM DARK */}
              <div className="relative text-bg lg:h-[150px]">
                <div
                  aria-hidden
                  className="pointer-events-none absolute inset-y-0 left-0 bg-text"
                  style={{
                    right: "min(0px, calc((100vw - 1440px) / -2))",
                  }}
                />

                <div className="relative h-full">
                  <div aria-hidden className="h-px w-full bg-bg/20" />

                  <div className="flex h-full items-center px-10 lg:px-12">
                    <div className="h-px flex-1 bg-bg/20" />
                    <a
                      href="#cta"
                      className="ml-10 whitespace-nowrap text-[22px] font-extrabold tracking-tight hover-accent md:text-[26px] lg:text-[30px]"
                    >
                      начать проект
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* divider before blue bar */}
          <div aria-hidden className="h-px w-full bg-text/20" />
        </div>

        {/* BOTTOM BAR */}
        <div className="relative text-bg lg:h-[100px]">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-y-0 left-1/2 w-screen -translate-x-1/2 bg-accent-3"
          />

          <div className="relative flex h-full items-center justify-between px-10 lg:px-12">
            <div className="text-[16px] font-medium text-text transition-colors duration-300 hover-accent">
              © 2026 (ООО "БЭНИФИТ")
            </div>
            <div className="text-[16px] font-medium text-text transition-colors duration-300 hover-accent">
              Сделано ЮНИ.ai
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
