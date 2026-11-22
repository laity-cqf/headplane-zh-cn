import { copyFileSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";

import { defineConfig, type DefaultTheme } from "vitepress";

import { localizeThemeLabels } from "./theme-labels";

function sidebar(chinese: boolean): DefaultTheme.SidebarItem[] {
  const p = chinese ? "/zh-CN" : "";
  const item = (en: string, zh: string, path: string) => ({
    text: chinese ? zh : en,
    link: p + path,
  });
  return [
    {
      text: chinese ? "开始使用" : "Getting Started",
      items: [
        item("What is Headplane?", "Headplane 是什么？", "/introduction"),
        item("Language and maintenance", "语言与维护", "/features/language"),
        {
          ...item("Installation", "安装", "/install"),
          items: [
            item("Limited Mode", "受限模式", "/install/limited-mode"),
            item("Native Mode", "原生模式", "/install/native-mode"),
            item("Docker", "Docker", "/install/docker"),
          ],
        },
        {
          ...item("Configuration", "配置", "/configuration"),
          items: [
            item("Common Issues", "常见问题", "/configuration/common-issues"),
            item("TLS & Certificates", "TLS 与证书", "/configuration/tls"),
            item("Sensitive Values", "敏感值", "/configuration#sensitive-values"),
          ],
        },
        item("Nix", "Nix", "/Nix"),
        item("NixOS", "NixOS", "/NixOS-options"),
      ],
    },
    {
      text: chinese ? "功能" : "Features",
      items: [
        item("Machines", "设备", "/features/machines-bilingual"),
        item("Users", "用户", "/features/users-bilingual"),
        {
          ...item("Single Sign-On (SSO)", "单点登录（SSO）", "/features/sso"),
          items: [item("Proxy Authentication", "代理认证", "/features/proxy-auth")],
        },
        item("Access Control", "访问控制", "/features/acls"),
        item("Headscale 0.29", "Headscale 0.29", "/features/headscale-029"),
        item("DNS", "DNS", "/features/dns"),
        item("Settings", "设置", "/features/settings"),
        item("Headplane Agent", "Headplane Agent", "/features/agent"),
        item("Browser SSH", "浏览器 SSH", "/features/ssh"),
      ],
    },
    {
      text: chinese ? "开发" : "Development",
      collapsed: true,
      items: [
        item("Architecture", "架构", "/development/architecture"),
        item("Contributing", "贡献指南", "/CONTRIBUTING"),
        item("Security", "安全", "/SECURITY"),
      ],
    },
  ];
}

export default defineConfig({
  vite: {
    plugins: [localizeThemeLabels()],
    define: { __HEADPLANE_BETA_DOCS__: JSON.stringify(process.env.HEADPLANE_BETA_DOCS === "true") },
  },
  buildEnd(site) {
    copyFileSync(
      fileURLToPath(new URL("../../config.example.yaml", import.meta.url)),
      resolve(site.outDir, "config.example.yaml"),
    );
  },
  title: "Headplane",
  description: "Community-maintained, unofficial bilingual fork of tale/headplane",
  cleanUrls: true,
  // core.symlinks=false checks out the upstream symlink as target text on Windows.
  markdown: {
    // Also pass build-time strings directly: the local-search renderer may
    // initialize VitePress's shared Markdown instance before page rendering.
    locales: {
      "zh-CN": {
        codeCopyButton: { tooltipText: "复制代码", copiedText: "已复制" },
        container: {
          tipLabel: "提示",
          warningLabel: "警告",
          dangerLabel: "危险",
          infoLabel: "说明",
          detailsLabel: "详细信息",
          noteLabel: "注意",
          importantLabel: "重要",
          cautionLabel: "谨慎",
        },
      },
    },
    config(md) {
      md.core.ruler.before("normalize", "headplane-changelog-source", (state) => {
        if (state.src.trim() === "./../CHANGELOG.md")
          state.src = readFileSync(
            fileURLToPath(new URL("../../CHANGELOG.md", import.meta.url)),
            "utf8",
          );
      });
      md.core.ruler.push("headplane-heading-labels", (state) => {
        if (state.env.localeIndex !== "zh-CN") return;
        for (const token of state.tokens) {
          for (const child of token.children ?? []) {
            if (child.attrGet("class") !== "header-anchor") continue;
            const title = child.attrGet("aria-label")?.match(/^Permalink to “(.*)”$/)?.[1];
            if (title) child.attrSet("aria-label", `指向“${title}”的永久链接`);
          }
        }
      });
    },
  },
  transformHead({ siteData }) {
    return [["link", { rel: "icon", type: "image/svg+xml", href: siteData.base + "logo.svg" }]];
  },
  locales: {
    root: {
      label: "English",
      lang: "en",
      themeConfig: {
        nav: [
          { text: "Home", link: "/" },
          { text: "Changelog", link: "/CHANGELOG" },
        ],
        sidebar: sidebar(false),
        footer: {
          message:
            'Unofficial community fork of <a href="https://github.com/tale/headplane">tale/headplane</a>. MIT license retained.',
          copyright: "Copyright © 2025 Aarnav Tale",
        },
      },
    },
    "zh-CN": {
      label: "简体中文",
      lang: "zh-CN",
      description: "tale/headplane 的非官方社区中英双语维护版",
      themeConfig: {
        nav: [
          { text: "首页", link: "/zh-CN/" },
          { text: "更新日志", link: "/zh-CN/CHANGELOG" },
        ],
        sidebar: sidebar(true),
        docFooter: { prev: "上一页", next: "下一页" },
        outline: { label: "本页目录" },
        lastUpdated: { text: "更新于", formatOptions: { dateStyle: "full", timeStyle: "medium" } },
        langMenuLabel: "切换语言",
        returnToTopLabel: "返回顶部",
        sidebarMenuLabel: "目录",
        darkModeSwitchLabel: "外观",
        lightModeSwitchTitle: "切换为浅色模式",
        darkModeSwitchTitle: "切换为深色模式",
        skipToContentLabel: "跳至正文",
        notFound: {
          title: "页面未找到",
          quote: "此页面不存在，请检查地址或返回首页。",
          linkLabel: "返回首页",
          linkText: "返回首页",
        },
        footer: {
          message:
            '基于 <a href="https://github.com/tale/headplane">tale/headplane</a> 的非官方社区维护版，保留 MIT 许可证。',
          copyright: "原作者版权所有 © 2025 Aarnav Tale",
        },
      },
    },
  },
  themeConfig: {
    logo: "/logo.svg",
    search: {
      provider: "local",
      options: {
        locales: {
          "zh-CN": {
            translations: {
              button: { buttonText: "搜索文档", buttonAriaLabel: "搜索文档" },
              modal: {
                displayDetails: "显示详细列表",
                resetButtonTitle: "清除搜索",
                backButtonTitle: "关闭搜索",
                noResultsText: "未找到相关结果",
                footer: {
                  selectText: "选择",
                  selectKeyAriaLabel: "回车键",
                  navigateText: "切换",
                  navigateUpKeyAriaLabel: "向上键",
                  navigateDownKeyAriaLabel: "向下键",
                  closeText: "关闭",
                  closeKeyAriaLabel: "Esc 键",
                },
              },
            },
          },
        },
      },
    },
    socialLinks: [
      { icon: "github", link: "https://github.com/laity-cqf/headplane-zh-cn" },
      { icon: "githubsponsors", link: "https://github.com/sponsors/tale" },
      { icon: "kofi", link: "https://ko-fi.com/atale" },
    ],
    lastUpdated: { text: "Updated at", formatOptions: { dateStyle: "full", timeStyle: "medium" } },
  },
});
