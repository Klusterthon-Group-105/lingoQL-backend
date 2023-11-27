import * as dotenv from 'dotenv';
import * as net from 'net';
import * as url from 'url';
import { ChatOpenAI } from 'langchain/chat_models/openai';
import { SqlDatabase } from 'langchain/sql_db';
import { DataSource } from 'typeorm';
import { SqlDatabaseChain } from 'langchain/chains/sql_db';
import { BadRequestException, Httpcode, InternalServerException, logger } from '../utils';

dotenv.config();
const OpenAIKey = process.env.OPENAI_API_KEY;

interface askYourDBPayload {
  dbType: any;
  dbURI: string;
  userInput: string;
}

class LingoService {
  private model = new ChatOpenAI({ openAIApiKey: OpenAIKey, temperature: 0.9 });
  private database: SqlDatabase | null = null;

  private async connectToDB(payload: askYourDBPayload) {
    try {
      let port = payload.dbType === 'postgres' ? 5432 : 3306;
      const grabURIInfo = await this.extractConnectionDetails(payload.dbURI);
      const isDatabaseUP = await this.pingDatabase(grabURIInfo.hostname, port);

      if (!isDatabaseUP) {
        throw new BadRequestException({
          httpCode: Httpcode.BAD_REQUEST,
          description: 'Database is not active or reachable',
        });
      }

      if (isDatabaseUP) {
        logger.info('Database is up and active');
        this.database = await SqlDatabase.fromDataSourceParams({
          appDataSource: new DataSource({
            type: payload.dbType,
            database: grabURIInfo.database,
            host: grabURIInfo.hostname,
            port: port,
            username: grabURIInfo.username,
            password: grabURIInfo.password,
            ssl: { rejectUnauthorized: true },
          }),
        });
        logger.info('Connected to the database');
        return this.database;
      }
    } catch (err: any) {
      logger.error(`Error connecting to your database:, ${err}`);
      throw new InternalServerException({
        httpCode: Httpcode.INTERNAL_SERVER_ERROR,
        description: err,
      });
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
        throw new BadRequestException({
          httpCode: Httpcode.BAD_REQUEST,
          description: 'Database connection not established.',
        });
      }
    } catch (err: any) {
      console.error(err.message);
      throw new InternalServerException({
        httpCode: Httpcode.INTERNAL_SERVER_ERROR,
        description: err,
      });
    }
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

  private async extractConnectionDetails(
    databaseUri: string,
  ): Promise<{ hostname: string; username: string; password: string; database: string }> {
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
