/**
 * Experiment Data: 5 Engineering Projects with 4 Options Each
 * 
 * Each project represents a city infrastructure construction project
 * with different budget, risk, benefit, and duration characteristics.
 * 
 * AI recommendations are preset to medium-high benefit, medium risk options
 * for the first 4 rounds to support research hypotheses.
 */

const PROJECTS = [
    {
        id: 1,
        name: "城市轨道交通三号线延伸工程",
        description: "拟建设地铁三号线延伸段，连接城区东部新开发区域，全长约12公里，设站8座。该项目旨在缓解城区东部交通压力，促进区域经济发展。",
        options: [
            {
                id: "A",
                name: "方案A - 全地下方案",
                budget: 180,
                risk: 5,
                benefit: 72,
                duration: 48,
                riskCategory: "low"
            },
            {
                id: "B",
                name: "方案B - 地下+高架混合方案",
                budget: 145,
                risk: 8,
                benefit: 78,
                duration: 36,
                riskCategory: "medium"
            },
            {
                id: "C",
                name: "方案C - 经济优化方案",
                budget: 120,
                risk: 12,
                benefit: 82,
                duration: 30,
                riskCategory: "high"
            },
            {
                id: "D",
                name: "方案D - 分期实施方案",
                budget: 95,
                risk: 6,
                benefit: 65,
                duration: 60,
                riskCategory: "low"
            }
        ],
        aiRecommendation: "B" // Medium benefit, medium risk
    },
    {
        id: 2,
        name: "市民文化艺术中心建设项目",
        description: "拟在市中心建设综合性文化艺术中心，包含剧院、展览馆、图书馆等功能区，总建筑面积约8万平方米，打造城市文化地标。",
        options: [
            {
                id: "A",
                name: "方案A - 高端定制方案",
                budget: 85,
                risk: 7,
                benefit: 75,
                duration: 42,
                riskCategory: "medium"
            },
            {
                id: "B",
                name: "方案B - 标准建设方案",
                budget: 62,
                risk: 4,
                benefit: 68,
                duration: 36,
                riskCategory: "low"
            },
            {
                id: "C",
                name: "方案C - 创新设计方案",
                budget: 78,
                risk: 11,
                benefit: 88,
                duration: 40,
                riskCategory: "high"
            },
            {
                id: "D",
                name: "方案D - 快速推进方案",
                budget: 70,
                risk: 15,
                benefit: 72,
                duration: 24,
                riskCategory: "high"
            }
        ],
        aiRecommendation: "A" // Medium-high benefit, medium risk
    },
    {
        id: 3,
        name: "智慧城市数据中心项目",
        description: "拟建设市级智慧城市大数据中心，整合政务、交通、环保等多源数据，提升城市治理数字化水平，支撑智慧城市建设。",
        options: [
            {
                id: "A",
                name: "方案A - 自建自运营方案",
                budget: 45,
                risk: 9,
                benefit: 80,
                duration: 24,
                riskCategory: "medium"
            },
            {
                id: "B",
                name: "方案B - 政企合作方案",
                budget: 32,
                risk: 6,
                benefit: 72,
                duration: 18,
                riskCategory: "medium"
            },
            {
                id: "C",
                name: "方案C - 云服务外包方案",
                budget: 28,
                risk: 4,
                benefit: 65,
                duration: 12,
                riskCategory: "low"
            },
            {
                id: "D",
                name: "方案D - 超前部署方案",
                budget: 58,
                risk: 14,
                benefit: 92,
                duration: 30,
                riskCategory: "high"
            }
        ],
        aiRecommendation: "A" // High benefit, medium risk
    },
    {
        id: 4,
        name: "城市防洪排涝改造工程",
        description: "拟对城区主要河道及排水系统进行全面改造升级，提升防洪标准从20年一遇提升至50年一遇，增强城市防灾能力。",
        options: [
            {
                id: "A",
                name: "方案A - 全面改造方案",
                budget: 125,
                risk: 5,
                benefit: 70,
                duration: 48,
                riskCategory: "low"
            },
            {
                id: "B",
                name: "方案B - 重点区域优先方案",
                budget: 88,
                risk: 8,
                benefit: 76,
                duration: 36,
                riskCategory: "medium"
            },
            {
                id: "C",
                name: "方案C - 创新技术方案",
                budget: 95,
                risk: 12,
                benefit: 85,
                duration: 32,
                riskCategory: "high"
            },
            {
                id: "D",
                name: "方案D - 分阶段实施方案",
                budget: 75,
                risk: 6,
                benefit: 62,
                duration: 60,
                riskCategory: "low"
            }
        ],
        aiRecommendation: "B" // Medium-high benefit, medium risk
    },
    {
        id: 5,
        name: "新城区综合医院建设项目",
        description: "拟在新城区建设一所三级甲等综合医院，规划床位1500张，配套先进医疗设备，满足区域医疗卫生服务需求。",
        options: [
            {
                id: "A",
                name: "方案A - 高标准建设方案",
                budget: 150,
                risk: 6,
                benefit: 75,
                duration: 48,
                riskCategory: "medium"
            },
            {
                id: "B",
                name: "方案B - 标准化建设方案",
                budget: 115,
                risk: 4,
                benefit: 70,
                duration: 42,
                riskCategory: "low"
            },
            {
                id: "C",
                name: "方案C - 智慧医院方案",
                budget: 135,
                risk: 11,
                benefit: 88,
                duration: 40,
                riskCategory: "high"
            },
            {
                id: "D",
                name: "方案D - 快速建成方案",
                budget: 128,
                risk: 16,
                benefit: 82,
                duration: 30,
                riskCategory: "high"
            }
        ],
        // Note: Round 5 AI recommendation is intentionally high-risk to test hypothesis
        aiRecommendation: "C" // High benefit, high risk (>10% triggers extreme event)
    }
];

/**
 * Utility function to shuffle array (Fisher-Yates algorithm)
 * Used for randomizing option order within each round
 */
function shuffleArray(array) {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
}

/**
 * Get project data for a specific round with shuffled options
 * @param {number} roundNumber - The round number (1-5)
 * @returns {Object} Project data with shuffled options
 */
function getProjectForRound(roundNumber) {
    const project = PROJECTS[roundNumber - 1];
    return {
        ...project,
        options: shuffleArray(project.options)
    };
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { PROJECTS, shuffleArray, getProjectForRound };
}
