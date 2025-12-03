(globalThis.TURBOPACK = globalThis.TURBOPACK || []).push(["static/chunks/[project]_frontend_efac56._.js", {

"[project]/frontend/config/wagmi.ts [app-client] (ecmascript)": (({ r: __turbopack_require__, f: __turbopack_require_context__, i: __turbopack_import__, s: __turbopack_esm__, v: __turbopack_export_value__, n: __turbopack_export_namespace__, c: __turbopack_cache__, l: __turbopack_load__, j: __turbopack_dynamic__, p: __turbopack_resolve_absolute_path__, U: __turbopack_relative_url__, R: __turbopack_resolve_module_id_path__, g: global, __dirname, k: __turbopack_refresh__ }) => (() => {
"use strict";

__turbopack_esm__({
    "config": ()=>config,
    "hardhatChain": ()=>hardhatChain,
    "projectId": ()=>projectId
});
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$web3modal$2f$wagmi$2f$dist$2f$esm$2f$exports$2f$react$2f$config$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$7b$module__evaluation$7d$__ = __turbopack_import__("[project]/node_modules/@web3modal/wagmi/dist/esm/exports/react/config.js [app-client] (ecmascript) {module evaluation}");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$web3modal$2f$wagmi$2f$dist$2f$esm$2f$src$2f$utils$2f$defaultWagmiReactConfig$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_import__("[project]/node_modules/@web3modal/wagmi/dist/esm/src/utils/defaultWagmiReactConfig.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$wagmi$2f$core$2f$dist$2f$esm$2f$utils$2f$cookie$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_import__("[project]/node_modules/@wagmi/core/dist/esm/utils/cookie.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$wagmi$2f$core$2f$dist$2f$esm$2f$createStorage$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_import__("[project]/node_modules/@wagmi/core/dist/esm/createStorage.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$viem$2f$_esm$2f$chains$2f$definitions$2f$mainnet$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_import__("[project]/node_modules/viem/_esm/chains/definitions/mainnet.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$viem$2f$_esm$2f$chains$2f$definitions$2f$sepolia$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_import__("[project]/node_modules/viem/_esm/chains/definitions/sepolia.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$polyfills$2f$process$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_import__("[project]/node_modules/next/dist/build/polyfills/process.js [app-client] (ecmascript)");
"__TURBOPACK__ecmascript__hoisting__location__";
;
;
;
const hardhatChain = {
    id: 31337,
    name: "Localhost",
    nativeCurrency: {
        decimals: 18,
        name: "Ether",
        symbol: "ETH"
    },
    rpcUrls: {
        default: {
            http: [
                "http://127.0.0.1:8545"
            ]
        },
        public: {
            http: [
                "http://127.0.0.1:8545"
            ]
        }
    },
    testnet: true
};
const projectId = ("TURBOPACK compile-time value", "") || "c0f7346590d8544723f2a51a8538e6f3"; // Fallback ID for dev
if ("TURBOPACK compile-time falsy", 0) {
    "TURBOPACK unreachable";
}
const metadata = {
    name: "DeStudy",
    description: "Decentralized Study Notes Platform",
    url: "http://localhost:3000",
    icons: [
        "https://avatars.githubusercontent.com/u/37784886"
    ]
};
// Create wagmiConfig
const chains = [
    hardhatChain,
    __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$viem$2f$_esm$2f$chains$2f$definitions$2f$mainnet$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["mainnet"],
    __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$viem$2f$_esm$2f$chains$2f$definitions$2f$sepolia$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["sepolia"]
];
const config = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$web3modal$2f$wagmi$2f$dist$2f$esm$2f$src$2f$utils$2f$defaultWagmiReactConfig$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["defaultWagmiConfig"]({
    chains,
    projectId,
    metadata,
    ssr: true,
    storage: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$wagmi$2f$core$2f$dist$2f$esm$2f$createStorage$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["createStorage"]({
        storage: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$wagmi$2f$core$2f$dist$2f$esm$2f$utils$2f$cookie$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cookieStorage"]
    })
});

})()),
"[project]/frontend/app/providers.tsx [app-client] (ecmascript)": (({ r: __turbopack_require__, f: __turbopack_require_context__, i: __turbopack_import__, s: __turbopack_esm__, v: __turbopack_export_value__, n: __turbopack_export_namespace__, c: __turbopack_cache__, l: __turbopack_load__, j: __turbopack_dynamic__, p: __turbopack_resolve_absolute_path__, U: __turbopack_relative_url__, R: __turbopack_resolve_module_id_path__, g: global, __dirname, k: __turbopack_refresh__ }) => (() => {
"use strict";

__turbopack_esm__({
    "Providers": ()=>Providers
});
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_import__("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$query$2d$core$2f$build$2f$modern$2f$queryClient$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_import__("[project]/node_modules/@tanstack/query-core/build/modern/queryClient.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$QueryClientProvider$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_import__("[project]/node_modules/@tanstack/react-query/build/modern/QueryClientProvider.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$wagmi$2f$dist$2f$esm$2f$context$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_import__("[project]/node_modules/wagmi/dist/esm/context.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$config$2f$wagmi$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_import__("[project]/frontend/config/wagmi.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$web3modal$2f$wagmi$2f$dist$2f$esm$2f$exports$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$7b$module__evaluation$7d$__ = __turbopack_import__("[project]/node_modules/@web3modal/wagmi/dist/esm/exports/react/index.js [app-client] (ecmascript) {module evaluation}");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$web3modal$2f$wagmi$2f$dist$2f$esm$2f$exports$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$7b$locals$7d$__ = __turbopack_import__("[project]/node_modules/@web3modal/wagmi/dist/esm/exports/react/index.js [app-client] (ecmascript) {locals}");
"__TURBOPACK__ecmascript__hoisting__location__";
"use client";
;
;
;
;
;
// Setup queryClient
const queryClient = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$query$2d$core$2f$build$2f$modern$2f$queryClient$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["QueryClient"]();
if (!__TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$config$2f$wagmi$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["projectId"]) throw new Error("Project ID is not defined");
// Create modal
__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$web3modal$2f$wagmi$2f$dist$2f$esm$2f$exports$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$7b$locals$7d$__["createWeb3Modal"]({
    wagmiConfig: __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$config$2f$wagmi$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["config"],
    projectId: __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$config$2f$wagmi$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["projectId"],
    enableAnalytics: true,
    enableOnramp: true
});
function Providers({ children }) {
    return /*#__PURE__*/ __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"](__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$wagmi$2f$dist$2f$esm$2f$context$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["WagmiProvider"], {
        config: __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$config$2f$wagmi$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["config"],
        children: /*#__PURE__*/ __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"](__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$QueryClientProvider$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["QueryClientProvider"], {
            client: queryClient,
            children: children
        }, void 0, false, {
            fileName: "<[project]/frontend/app/providers.tsx>",
            lineNumber: 25,
            columnNumber: 7
        }, this)
    }, void 0, false, {
        fileName: "<[project]/frontend/app/providers.tsx>",
        lineNumber: 24,
        columnNumber: 5
    }, this);
}
_c = Providers;
var _c;
__turbopack_refresh__.register(_c, "Providers");

})()),
}]);

//# sourceMappingURL=[project]_frontend_efac56._.js.map