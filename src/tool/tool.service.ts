import { BadRequestException, Injectable, InternalServerErrorException } from '@nestjs/common';
import { exec } from 'child_process';
import * as fs from 'fs/promises';
import * as path from 'path';
import { promisify } from 'util';
import { ConvertImgResponseDto } from './dto/convert-img-response.dto';
import { ConvertImgDto } from './dto/convert-img.dto';

const execAsync = promisify(exec);

@Injectable()
export class ToolService {
  private readonly isWindows = process.platform === 'win32';
  private readonly command = this.isWindows ? 'magick' : 'convert';

  /**
   * PSD/AI 파일을 PNG 또는 JPEG으로 변환
   */
  async convertImage(convertImgDto: ConvertImgDto): Promise<ConvertImgResponseDto> {
    const { fileContent, outputFormat } = convertImgDto;
    
    // base64에서 파일 타입과 데이터 추출
    const base64Data = fileContent.replace(/^data:[^;]+;base64,/, '');
    const buffer = Buffer.from(base64Data, 'base64');
    
    // 파일 확장자 추정 (PSD 또는 AI)
    // PSD 파일의 경우 브라우저마다 다른 MIME 타입을 사용할 수 있음
    const isPSD = fileContent.includes('data:image/psd') || 
                  fileContent.includes('data:image/vnd.adobe.photoshop') ||
                  fileContent.includes('data:application/octet-stream') ||
                  fileContent.includes('data:image/x-photoshop');
    
    const isAI = fileContent.includes('data:image/ai') || 
                 fileContent.includes('data:application/postscript') ||
                 fileContent.includes('data:application/illustrator');
    
    if (!isPSD && !isAI) {
      // 디버깅을 위해 실제 MIME 타입을 로그에 출력
      const mimeType = fileContent.split(';')[0];
      console.log('감지된 MIME 타입:', mimeType);
      throw new BadRequestException(`지원하지 않는 파일 형식입니다. PSD 또는 AI 파일만 지원됩니다. 감지된 타입: ${mimeType}`);
    }
    
    const inputExt = isPSD ? '.psd' : '.ai';
    const outputExt = outputFormat === 'jpg' ? '.jpg' : '.png';
    
    // 임시 파일 경로 생성
    const timestamp = Date.now();
    const inputFileName = `input_${timestamp}${inputExt}`;
    const outputFileName = `output_${timestamp}${outputExt}`;
    const inputPath = path.join(process.cwd(), 'temp', inputFileName);
    const outputPath = path.join(process.cwd(), 'temp', outputFileName);
    
    try {
      // temp 디렉토리 생성
      await fs.mkdir(path.join(process.cwd(), 'temp'), { recursive: true });
      
      // 입력 파일 저장
      await fs.writeFile(inputPath, buffer);
      
      // ImageMagick 명령어 구성
      const quality = outputFormat === 'jpg' ? '-quality 90' : '';
      
      // PSD 파일의 경우 특별한 옵션 추가
      let command;
      if (isPSD) {
        // PSD 파일은 모든 레이어를 평면화하여 하나의 이미지로 변환
        command = `${this.command} "${inputPath}" -flatten -background white ${quality} "${outputPath}"`;
      } else {
        // AI 파일은 해상도를 600dpi로 높여서 변환
        command = `${this.command} -density 600 "${inputPath}" ${quality} "${outputPath}"`;
      }
      
      console.log('실행할 명령어:', command);
      
      // 변환 실행
      await execAsync(command);
      
      // 출력 파일 읽기
      const outputBuffer = await fs.readFile(outputPath);
      const outputBase64 = outputBuffer.toString('base64');
      
      // 파일 정보 가져오기
      const stats = await fs.stat(outputPath);
      
      // 임시 파일 삭제 (keepTempFiles가 '1'이 아닌 경우)
      if (convertImgDto.keepTempFiles !== '1') {
        try {
          await fs.unlink(inputPath);
          await fs.unlink(outputPath);
          console.log('임시 파일이 삭제되었습니다.');
        } catch (deleteError) {
          console.warn('임시 파일 삭제 중 오류:', deleteError.message);
        }
      } else {
        console.log('임시 파일이 유지됩니다.');
      }
      
      return {
        success: true,
        message: '이미지 변환이 성공적으로 완료되었습니다.',
        fileContent: `data:image/${outputFormat};base64,${outputBase64}`,
        fileSize: stats.size,
        modifiedDate: stats.mtime,
        outputFormat: outputFormat,
      };
      
    } catch (error) {
      console.error('변환 오류 상세:', error);
      throw new InternalServerErrorException(`이미지 변환 중 오류가 발생했습니다: ${error.message}`);
    }
  }

  /**
   * ImageMagick이 설치되어 있는지 확인
   */
  async checkImageMagick(): Promise<boolean> {
    try {
      await execAsync(`${this.command} -version`);
      return true;
    } catch (error) {
      return false;
    }
  }
}
