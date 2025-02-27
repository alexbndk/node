import { AxiosInstance } from 'axios';
import LRU from 'lru-cache';
export interface CacheConfig {
    max?: number;
    maxAge?: number;
}
export interface LookupResponse {
    ip: string;
    is_eu: boolean;
    city?: string;
    region?: string;
    region_code?: string;
    country_name: string;
    country_code: string;
    continent_name: string;
    continent_code: string;
    latitude: number;
    longitude: number;
    postal?: string;
    calling_code: string;
    flag: string;
    emoji_flag: string;
    emoji_unicode: string;
    asn: {
        asn: string;
        name: string;
        domain: string;
        route: string;
        type: string;
    };
    languages: {
        name: string;
        native: string;
    }[];
    currency: {
        name: string;
        code: string;
        symbol: string;
        native: string;
        plural: string;
    };
    time_zone: {
        name: string;
        abbr: string;
        offset: string;
        is_dst: boolean;
        current_time: string;
    };
    threat: {
        is_tor: boolean;
        is_proxy: boolean;
        is_anonymous: boolean;
        is_known_attacker: boolean;
        is_known_abuser: boolean;
        is_threat: boolean;
        is_bogon: boolean;
    };
    count: number;
    status: number;
}
export default class IPData {
    axios?: AxiosInstance;
    apiKey?: string;
    cache?: LRU<string, LookupResponse>;
    constructor(apiKey: string, cacheConfig?: CacheConfig);
    lookup(ip?: string, selectField?: string, fields?: string[]): Promise<LookupResponse>;
    bulkLookup(ips: string[], fields?: string[]): Promise<LookupResponse[]>;
}
