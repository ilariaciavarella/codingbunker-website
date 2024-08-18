import NotionDatabaseEventsQueryProperties from '@/types/NotionDatabaseEventsQueryProperties'
import NotionDatabaseQueryType from '@/types/NotionDatabaseQueryType'
import axios, { AxiosRequestConfig } from 'axios'
import { Client as NotionClient }  from '@notionhq/client'
import { DatabaseObjectResponse, PageObjectResponse, PartialDatabaseObjectResponse, PartialPageObjectResponse } from '@notionhq/client/build/src/api-endpoints'


const NotionApiClient = () =>{

    const notionClient = (): NotionClient =>{
        return new NotionClient({
            auth:process.env.NOTION_TOKEN,
        })

    }
    const request = (config: AxiosRequestConfig): any =>{
        return axios.request({
            baseURL: "https://api.notion.com",
            headers: {
                "Authorization": "Bearer " + process.env.NOTION_TOKEN,
                "Notion-Version": "2022-06-28"
            },
            ...config
        })
    }

    const fetchSingleEvent = async (slug: string) : Promise<NotionDatabaseEventsQueryProperties> =>{
        const response = await request({
            url: `v1/databases/${process.env.NOTION_EVENTS_DATABASE}/query`,
            method: "POST",
            data:{
                "filter": {
                    "property": "slug",
                    "rich_text": {
                        "equals": slug
                    }
                }
            }
        })

        return response.data?.results?.[0]
    }

    const fetchLastEvents = async () : Promise<(PageObjectResponse | PartialPageObjectResponse | PartialDatabaseObjectResponse | DatabaseObjectResponse)[]> => {
        if(!process.env.NOTION_EVENTS_DATABASE) return [];
        const data = await notionClient().databases.query({
            database_id: process.env.NOTION_EVENTS_DATABASE,
            archived: false,
            in_trash: false,
            page_size:3,
            sorts: [
                {
                    direction: "descending",
                    property: "Date"
                }
            ]
        })
        
        return data.results;
    }

    const fetchEvents = async () : Promise<NotionDatabaseQueryType<NotionDatabaseEventsQueryProperties>> => {
        const response = await request({
            url: `v1/databases/${process.env.NOTION_EVENTS_DATABASE}/query`,
            method: "POST"
        })

        return response.data
    }


    const fetchCrew = async () => {
        const response = await request({
            url: `v1/databases/${process.env.NOTION_CREW_DATABASE}/query`,
            method: "POST"
        })

        return response.data 
    }

    const addSubscriber = async (email : string) => {
        const response = await request({
            url: `v1/databases/${process.env.NOTION_SUBSCRIBERS_DATABASE}/query`,
            method: "POST"
        })

        return response.data
    }


    return {
        fetchEvents,
        fetchSingleEvent,
        fetchCrew,
        addSubscriber,
        fetchLastEvents
    }

}


export default NotionApiClient