import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { ConfigModule } from './config/config.module';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { ProjectsModule } from './projects/projects.module';
import { CanonModule } from './canon/canon.module';
import { StoryModule } from './story/story.module';
import { AgentsModule } from './agents/agents.module';
import { InternalModule } from './internal/internal.module';
import { AuthGuard } from './common/guards';

@Module({
  imports: [
    // Serve Next.js static build
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', '..', 'web', 'out'),
      exclude: ['/api/v1/{*path}', '/api/docs/{*path}'],
    }),
    ConfigModule,
    PrismaModule,
    AuthModule,
    UsersModule,
    ProjectsModule,
    CanonModule,
    StoryModule,
    AgentsModule,
    InternalModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: AuthGuard,
    },
  ],
})
export class AppModule {}
