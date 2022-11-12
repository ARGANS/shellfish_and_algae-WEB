const CHECK_ACTIONS = {
    checkFile: 'file_exists'
}
const CONTAINER_CONF = {
    Volumes: {
        "/media/global": {},
        "/media/share": {}
    },
    HostConfig: {
        "AutoRemove": true,
        "Binds": [
            "ac_share:/media/share",
            "ac_global:/media/global"
        ],
    },
}


const pipeline = {
    NutrientImpact: {
        // pipeline step id
        // id: '',
        description: 'Nutrient impact',
        // Lifecycle tests
        status: {
            started: {
                action: CHECK_ACTIONS.checkFile,
                path: 'start.mark',
                // relative to the scope path
            },
            completed: {
                action: CHECK_ACTIONS.checkFile,
                path: 'end.mark',
            }
        },
        // Container specification
        container: {
            // ??? the function can be useless!
            Image: 'ac-dataread/runtime',
            ...CONTAINER_CONF,
            Env: [
                'INPUT_SOURCE=/media/share/data/{{model_id}}/_pretreated',
                'INPUT_DESTINATION=/media/share/data/{{model_id}}/_nutrientimpact',
                'INPUT_MODEL_PROPERTIES_JSON={{model_body2json}}',
                'RUN_SIMULATION_WITH_FARMS=1',
                'PYTHONDONTWRITEBYTECODE=1',
            ],
            Labels: {
                'container.action:termination.notification.link': 'mailto:{{user_email}}?subject=Shellfish and Algae platform: model {{model_id}}&body=This email is just to let you know that the NutrientImpact task has been completed.',
                'task.model.id': '{{model_id}}',
                'task.model.type': '{{model_type}}',
                // has an impact on tracking pipeline tasks!
                'task.type': '{{id}}', // =NutrientImpact
                'task.user': '{{user_username}}'
            },
        },
        dir: (props) => `/media/share/data/${props.id}/_nutrientimpact`,
        dependsOn: '', // linked pipeline id
    },
}

class PipelineStep {
    #id = null;
    #data = null;
    #variables = null;

    constructor(id, stepData, variables) {
        this.#id = id;
        this.#data = stepData
        this.#variables = variables;
    }

    getFileChecks() {
		const _dir = this.dir;
		return Object.entries(this.#data.status).map(([check, {action, path}]) => {
			return {
				path: path.startsWith('/') ? path : _dir + '/' + path,
				check,
				action,
				step: this.id
			}
		})
    }

	interpolate_container_data(mapObject) {
		return JSON.stringify(this.#data.container, null, '\t').replace(/\{\{(.*?)\}\}/g, (match, fragment, pos, string) => {
			if (!mapObject.hasOwnProperty(fragment)) return match;
			return mapObject[fragment];
		});
	}
	
	get id() {
		return this.#id;
	}
	
	get dir(){
		return this.#data.dir(this.#variables)
	}
}

const pipelineVariables = {
	id: 12
}

const steps = Object.entries(pipeline).map(([id, stepData]) => {
    return new PipelineStep(id, stepData, pipelineVariables)
});

steps.forEach(step => {
	const containerConf = steps[0].interpolate_container_data({
		model_id: '12',
		model_type: 'Algae',
		user_email: 'test@fmail.com'	,
		user_username: 'Peter',
		model_body2json: JSON.stringify({aa:1, bb:2}),
		id: steps[0].id
	})

	console.log("ContainerConf: %s", containerConf);
	console.log("Step dedicated directory %s", step.dir);
	console.dir(step.getFileChecks())
})
