import * as dotenv from 'dotenv';
import * as net from 'net';
import * as url from 'url';
import { PromptTemplate } from "langchain/prompts";
import { ChatOpenAI } from "langchain/chat_models/openai";
import { CSVLoader } from "langchain/document_loaders/fs/csv";
import { SqlDatabase } from "langchain/sql_db";
import { DataSource } from "typeorm";
import { SqlDatabaseChain } from "langchain/chains/sql_db";
import { createSqlAgent, SqlToolkit } from "langchain/agents/toolkits/sql";


dotenv.config();
const OpenAIKey = process.env.OPENAI_API_KEY;

interface convoPayload {
    message: string;
}

interface connectDBPayload {
    dbType: any,
    dbURI: string,
}

interface askYourDBPayload {
    dbType: any,
    dbURI: string,
    userInput: string
}

const template = `
I want you to act as an informant who gives back information about a query from a SQL database

when provided with the query question and the results from the database, answer the query question in a easy-to-understand manner using few word.

--Examples--
reply this query 'how many cars were sold' using this result (11914,)  ->  '11914 cars were sold.'
reply this query 'what are the different Market Categories return the top 2' using this result [('high-performance',), ('luxury',)]  ->  'The top two market categories are high-performance and luxury.'
reply this query 'what is the average Number of Doors' using this result [(3.4360933825999327,)] -> The average number of doors is 3.44.

reply this query {query} using this result {result}

response ""

`

class LingoService {

    private model =  new ChatOpenAI({ openAIApiKey: OpenAIKey, temperature: 0.9, })
    private database: SqlDatabase | null = null;

    public async convertUserInputToSQL(userInput: convoPayload) {
        const agentPrompt: string = "Given the user's input: {userInput}, generate a well-structured SQL query that effectively captures the user's intent. Provide only the SQL query, ensuring it is suitable for retrieving relevant data from the database."
        try {
            const prompt = PromptTemplate.fromTemplate(agentPrompt);

            const chain = prompt.pipe(this.model);

            const result = await chain.invoke({
                userInput: userInput.message
            });
            
            const cleanQuery = await this.cleanSQLQuery(result.content);
            return cleanQuery;

        } catch(err:any) {
            console.error(err);
            throw err;
        }
        
    }

    private async connectToDB(payload:askYourDBPayload) {
        try {
            let port = payload.dbType === 'postgres' ? 5432 : 3306;
            const grabURIInfo = await this.extractConnectionDetails(payload.dbURI);
            const isDatabaseUP = await this.pingDatabase(grabURIInfo.hostname, port);

            if (!isDatabaseUP) {
                throw new Error('Database is not active or reachable.');
            }

            if (isDatabaseUP) {
                console.info('Database is up and active');
                this.database = await SqlDatabase.fromDataSourceParams({
                    appDataSource:  new DataSource({
                        type: payload.dbType,
                        database: grabURIInfo.database,
                        host: grabURIInfo.hostname,
                        port: port,
                        username: grabURIInfo.username,
                        password: grabURIInfo.password,
                        ssl: { rejectUnauthorized: true }
                    })
                });
                console.info("Connected to the database:");
                return this.database;
            }
        } catch (err:any) {
            console.error("Error connecting to your database:", err);
            throw err;
        }
        
    }


    public async askYourDB(payload: askYourDBPayload) {
        try {
            if (!this.database) {
                await this.connectToDB(payload);
            }
            if (this.database) {
                const db_chain = new SqlDatabaseChain({
                    llm: this.model,
                    database: this.database,
                    verbose: true,
                });

                const result = await db_chain.run(payload.userInput);
                return result;
            } else {
                throw new Error('Database connection not established.');
            }
    
            /* const toolkit = new SqlToolkit(db, this.model);
            const executor = createSqlAgent(this.model, toolkit);
    
            console.log(`Executing with input "${payload.userInput}"...`);
            const input = payload.userInput
            const result = await executor.invoke({ input });
    
            console.log(`Got output ${result.output}`);
    
            return result */;
        } catch(err:any) {
            console.error(err.message);
            throw err;
        }
        



        
        /* const prompt = new PromptTemplate({
            inputVariables: ["query","result"],
            template: template
        });

        const db_chain = new SqlDatabaseChain({
            llm: this.model,
            database: db,
            verbose: true,
            prompt: prompt
        });

        const result = await db_chain.run(payload.userInput);
        return result; */
    }

    private async cleanSQLQuery(query: any) {
        const cleanedQuery = query.replace(/\n/g, ' ');
        return cleanedQuery;
    }

    private async pingDatabase(host: string, port: number): Promise<boolean> {
        return new Promise((resolve) => {
            const client = net.createConnection({ host, port });
    
            // Set a timeout for the connection attempt
            client.setTimeout(1000);
    
            client.on('connect', () => {
                // Connection successful
                client.end();
                resolve(true);
            });
    
            client.on('timeout', () => {
                // Connection timed out
                client.destroy();
                resolve(false);
            });
    
            client.on('error', () => {
                // Connection failed
                resolve(false);
            });
        });
    }

    private async extractConnectionDetails(databaseUri: string): Promise<{ hostname: string, username: string, password: string, database: string }> {
        const parsedUrl = new url.URL(databaseUri);
        return {
            hostname: parsedUrl.hostname,
            username: parsedUrl.username,
            password: parsedUrl.password,
            database: parsedUrl.pathname.substring(1),
        };
    }

}



export default LingoService;