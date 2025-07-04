/**
 * Shanoir NG - Import, manage and share neuroimaging data
 * Copyright (C) 2009-2019 Inria - https://www.inria.fr/
 * Contact us on https://project.inria.fr/shanoir/
 * 
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 * 
 * You should have received a copy of the GNU General Public License
 * along with this program. If not, see https://www.gnu.org/licenses/gpl-3.0.html
 */

import { Component, EventEmitter, Input, Output } from '@angular/core';
import { UntypedFormGroup } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';

import { ExtraDataService } from '../../extraData/shared/extradata.service';
import { BloodGasData } from '../shared/bloodGasData.model';
import { BloodGasDataFile } from '../shared/bloodGasDataFile.model';

import { EntityService } from 'src/app/shared/components/entity/entity.abstract.service';
import { slideDown } from '../../../../shared/animations/animations';
import { EntityComponent } from '../../../../shared/components/entity/entity.component.abstract';
import { ModesAware } from "../../../shared/mode/mode.decorator";
import * as PreclinicalUtils from '../../../utils/preclinical.utils';
import { ExtraData } from '../../extraData/shared/extradata.model';


@Component({
    selector: 'bloodgas-data-upload-form',
    templateUrl: 'bloodGasData-form.component.html',
    animations: [slideDown],
    standalone: false
})
@ModesAware
export class BloodGasDataFormComponent extends EntityComponent<BloodGasData> {

    @Input() examination_id:number;
    @Input() isStandalone:boolean = false;
    @Input() canModify: Boolean = false;
  
    fileToUpload: File = null;
    @Output() bloodGasDataReady = new EventEmitter();

    constructor(
        private route: ActivatedRoute,
        private extradatasService: ExtraDataService) {

        super(route, 'preclinical-bloodgasdata');
    }

    get bloodGasData(): BloodGasData { return this.entity; }
    set bloodGasData(bloodGasData: BloodGasData) { this.entity = bloodGasData; }
    
    getService(): EntityService<BloodGasData> {
        return this.extradatasService;
    }

    protected fetchEntity: () => Promise<BloodGasData> = () => {
        return  this.extradatasService.getExtraDatas(this.examination_id).then(extradatas => {
            return this.loadExaminationExtraDatas(extradatas);
        });
    }
   
    initView(): Promise<void> {
        return Promise.resolve();
    }

    initEdit(): Promise<void> {
        return Promise.resolve();
    }

    initCreate(): Promise<void> {
        this.entity = new BloodGasData();
        return Promise.resolve();
    }

    loadExaminationExtraDatas(extradatas: ExtraData[]): BloodGasData {
    	for (let ex of extradatas) {
    		// instanceof does not work??
    		if (ex.extradatatype != "Physiological data"){
    			return <BloodGasData>ex;
    		}
    	}
        return new BloodGasData();
    }

    buildForm(): UntypedFormGroup {
        return this.formBuilder.group({
        });
    }


    public save(): Promise<BloodGasData> {
        return this.extradatasService.createExtraData(PreclinicalUtils.PRECLINICAL_BLOODGAS_DATA,this.bloodGasData).then((bloodGasData) => {
            this.chooseRouteAfterSave(this.bloodGasData);
            this.consoleService.log('info', 'New preclinical bloodgasdata successfully saved with n° ' + bloodGasData.id);
            return bloodGasData;
        });
    }
    
    downloadFile() {
        this.extradatasService.downloadFile(this.entity.id);
    }

    fileChangeEvent(files: FileList){
    	this.fileToUpload = files.item(0);
    	this.bloodGasData.filename= this.fileToUpload.name;
    	let bloodGasDataFile: BloodGasDataFile = new BloodGasDataFile();
    	bloodGasDataFile.filename = this.fileToUpload.name;
    	bloodGasDataFile.bloodGasDataFile = this.fileToUpload;
    	if(!this.isStandalone){
    	 	this.bloodGasDataReady.emit(bloodGasDataFile);
    	 }
      	this.bloodGasData = new BloodGasData();
    }

    public async hasDeleteRight(): Promise<boolean> {
        return false;
    }

    
}