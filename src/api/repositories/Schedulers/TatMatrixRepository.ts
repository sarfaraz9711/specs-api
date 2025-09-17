import { EntityRepository, Repository } from 'typeorm';
import { TatMatrixModel } from '../../models/Schedulers/TatMatrixModel';


@EntityRepository(TatMatrixModel)
export class TatMatrixRepository extends Repository<TatMatrixModel> {
}
