import { FileUrlSaveModel } from '../../models/Schedulers/FileUrlSaveModel';
import { EntityRepository, Repository } from 'typeorm';

@EntityRepository(FileUrlSaveModel)
export class FileUrlSaveRepository extends Repository<FileUrlSaveModel>  {

}